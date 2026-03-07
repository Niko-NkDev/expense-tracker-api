import { users } from "../data/users";
import { User } from "../models/user.model";
import {
  findUserByUsername,
  registerUser,
  validatePassword,
  generateToken
} from "./auth.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("uuid", () => ({
  v4: () => "mock-user-id"
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  compare: jest.fn().mockResolvedValue(true as unknown as boolean)
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("signed-token")
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe("auth.service", () => {
  beforeEach(() => {
    users.length = 0;
    jest.clearAllMocks();
  });

  test("findUserByUsername devuelve el usuario correspondiente", async () => {
    const user: User = {
      id: "1",
      username: "usuario1",
      passwordHash: "hash",
      initialBalance: 0
    };
    users.push(user);

    const found = findUserByUsername("usuario1");

    expect(found).toBe(user);
  });

  test("registerUser crea un usuario nuevo con password hasheado", async () => {
    const user = await registerUser("usuario1", "mi-password");

    expect(mockedBcrypt.hash).toHaveBeenCalledWith("mi-password", 10);
    expect(user).toEqual({
      id: "mock-user-id",
      username: "usuario1",
      passwordHash: "hashed-password",
      initialBalance: 0
    });
    expect(users).toHaveLength(1);
    expect(users[0]).toEqual(user);
  });

  test("registerUser lanza error si el usuario ya existe", async () => {
    users.push({
      id: "1",
      username: "usuario1",
      passwordHash: "hash",
      initialBalance: 0
    });

    await expect(registerUser("usuario1", "otra"))
      .rejects.toThrow("USERNAME_TAKEN");
  });

  test("validatePassword usa bcrypt.compare y devuelve true/false", async () => {
    const user: User = {
      id: "1",
      username: "usuario1",
      passwordHash: "hash",
      initialBalance: 0
    };

    (mockedBcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    const ok = await validatePassword(user, "pwd");
    expect(ok).toBe(true);

    (mockedBcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
    const notOk = await validatePassword(user, "otra");
    expect(notOk).toBe(false);
  });

  test("generateToken delega en jwt.sign", () => {
    const payload = { userId: "1", username: "usuario1" };

    const token = generateToken(payload);

    expect(token).toBe("signed-token");
    expect(mockedJwt.sign).toHaveBeenCalledWith(
      payload,
      "dev-secret-change-me",
      { expiresIn: "1h" }
    );
  });
});
