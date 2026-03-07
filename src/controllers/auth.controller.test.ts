import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { users } from "../data/users";
import {
  register,
  login,
  listUsers,
  getBalance,
  updateBalance
} from "./auth.controller";

jest.mock("../services/auth.service", () => ({
  registerUser: jest.fn(),
  findUserByUsername: jest.fn(),
  validatePassword: jest.fn(),
  generateToken: jest.fn(),
  findUserById: jest.fn()
}));

const mockedAuth = authService as jest.Mocked<typeof authService>;

const createMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res as Response);
  res.json = jest.fn().mockReturnValue(res as Response);
  return res as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
};

describe("auth.controller - register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("devuelve 400 si faltan campos", async () => {
    const req = {
      body: { username: "usuario1" }
    } as unknown as Request;
    const res = createMockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Usuario y password son requeridos"
      })
    );
    expect(mockedAuth.registerUser).not.toHaveBeenCalled();
  });

  test("crea usuario y devuelve 201", async () => {
    const req = {
      body: { username: "usuario1", password: "pwd" }
    } as unknown as Request;
    const res = createMockResponse();

    const createdUser = {
      id: "1",
      username: "usuario1",
      passwordHash: "hash",
      initialBalance: 0
    };

    mockedAuth.registerUser.mockResolvedValueOnce(createdUser as any);
    mockedAuth.generateToken.mockReturnValueOnce("token123");

    await register(req, res);

    expect(mockedAuth.registerUser).toHaveBeenCalledWith("usuario1", "pwd");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: "1",
      username: "usuario1",
      token: "token123"
    });
  });

  test("devuelve 409 si el usuario ya existe", async () => {
    const req = {
      body: { username: "usuario1", password: "pwd" }
    } as unknown as Request;
    const res = createMockResponse();

    mockedAuth.registerUser.mockRejectedValueOnce(new Error("USERNAME_TAKEN"));

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "El usuario ya está registrado"
    });
  });
});

describe("auth.controller - login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("devuelve 400 si faltan campos", async () => {
    const req = {
      body: { username: "usuario1" }
    } as unknown as Request;
    const res = createMockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Usuario y password son requeridos"
      })
    );
    expect(mockedAuth.findUserByUsername).not.toHaveBeenCalled();
  });

  test("devuelve 401 si el usuario no existe", async () => {
    const req = {
      body: { username: "usuario1", password: "pwd" }
    } as unknown as Request;
    const res = createMockResponse();

    mockedAuth.findUserByUsername.mockReturnValueOnce(undefined as any);

    await login(req, res);

    expect(mockedAuth.findUserByUsername).toHaveBeenCalledWith("usuario1");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Credenciales inválidas"
    });
  });

  test("devuelve 401 si el password es inválido", async () => {
    const req = {
      body: { username: "usuario1", password: "pwd" }
    } as unknown as Request;
    const res = createMockResponse();

    const user = {
      id: "1",
      username: "usuario1",
      passwordHash: "hash",
      initialBalance: 0
    } as any;

    mockedAuth.findUserByUsername.mockReturnValueOnce(user);
    mockedAuth.validatePassword.mockResolvedValueOnce(false);

    await login(req, res);

    expect(mockedAuth.validatePassword).toHaveBeenCalledWith(user, "pwd");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Credenciales inválidas"
    });
  });

  test("devuelve 200 con token si el login es correcto", async () => {
    const req = {
      body: { username: "usuario1", password: "pwd" }
    } as unknown as Request;
    const res = createMockResponse();

    const user = {
      id: "1",
      username: "usuario1",
      passwordHash: "hash",
      initialBalance: 0
    } as any;

    mockedAuth.findUserByUsername.mockReturnValueOnce(user);
    mockedAuth.validatePassword.mockResolvedValueOnce(true);
    mockedAuth.generateToken.mockReturnValueOnce("token123");

    await login(req, res);

    expect(res.json).toHaveBeenCalledWith({
      id: "1",
      username: "usuario1",
      token: "token123"
    });
  });
});

describe("auth.controller - listUsers", () => {
  beforeEach(() => {
    users.length = 0;
  });

  test("devuelve usuarios sin passwordHash", () => {
    users.push(
      {
        id: "1",
        username: "usuario1",
        passwordHash: "hash1",
        initialBalance: 0
      },
      {
        id: "2",
        username: "usuario2",
        passwordHash: "hash2",
        initialBalance: 0
      }
    );

    const req = {} as Request;
    const res = createMockResponse();

    listUsers(req, res);

    expect(res.json).toHaveBeenCalledWith([
      { id: "1", username: "usuario1" },
      { id: "2", username: "usuario2" }
    ]);
  });
});

describe("auth.controller - balance", () => {
  const mockedAuth = authService as jest.Mocked<typeof authService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getBalance devuelve 401 si no hay usuario en la request", () => {
    const req = { } as Request;
    const res = createMockResponse();

    getBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token no proporcionado"
    });
  });

  test("getBalance devuelve el saldo inicial del usuario", () => {
    const req = {
      user: { userId: "1", username: "usuario1" }
    } as unknown as Request;
    const res = createMockResponse();

    mockedAuth.findUserById.mockReturnValueOnce({
      id: "1",
      username: "usuario1",
      passwordHash: "hash",
      initialBalance: 50000
    } as any);

    getBalance(req, res);

    expect(mockedAuth.findUserById).toHaveBeenCalledWith("1");
    expect(res.json).toHaveBeenCalledWith({ initialBalance: 50000 });
  });

  test("updateBalance aplica operación 'add' y devuelve el nuevo saldo", () => {
    const userObj = {
      id: "1",
      username: "usuario1",
      passwordHash: "hash",
      initialBalance: 10000
    } as any;

    const req = {
      user: { userId: "1", username: "usuario1" },
      body: { amount: 5000, operation: "add" }
    } as unknown as Request;
    const res = createMockResponse();

    mockedAuth.findUserById.mockReturnValueOnce(userObj);

    updateBalance(req, res);

    expect(mockedAuth.findUserById).toHaveBeenCalledWith("1");
    expect(userObj.initialBalance).toBe(15000);
    expect(res.json).toHaveBeenCalledWith({ initialBalance: 15000 });
  });
});
