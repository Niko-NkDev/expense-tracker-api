import { Request, Response } from "express";
import * as expenseService from "../services/expense.service";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary
} from "./expense.controller";

jest.mock("../services/expense.service", () => ({
  getAllExpenses: jest.fn(),
  createExpense: jest.fn(),
  updateExpense: jest.fn(),
  deleteExpense: jest.fn(),
  getSummary: jest.fn()
}));

const mockedService = expenseService as jest.Mocked<typeof expenseService>;

const createMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res as Response);
  res.json = jest.fn().mockReturnValue(res as Response);
  return res as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
};

describe("expense.controller - getExpenses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("devuelve 400 si la categoría es inválida", () => {
    const req = {
      query: { category: "Invalida" },
      user: { userId: "user-1", username: "usuario1" }
    } as unknown as Request;

    const res = createMockResponse();

    getExpenses(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Categoría inválida"
      })
    );
    expect(mockedService.getAllExpenses).not.toHaveBeenCalled();
  });

  test("llama al servicio con filtros correctos y devuelve el resultado", () => {
    const req = {
      query: {
        category: "Comida",
        startDate: "2025-01-01",
        endDate: "2025-01-31"
      },
      user: { userId: "user-1", username: "usuario1" }
    } as unknown as Request;

    const res = createMockResponse();

    const fakeExpenses = [{ id: "1" } as any];
    mockedService.getAllExpenses.mockReturnValue(fakeExpenses);

    getExpenses(req, res);

    expect(mockedService.getAllExpenses).toHaveBeenCalledWith(
      "user-1",
      "Comida",
      "2025-01-01",
      "2025-01-31"
    );
    expect(res.json).toHaveBeenCalledWith(fakeExpenses);
  });
});

describe("expense.controller - createExpense", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("devuelve 400 si la categoría es inválida", () => {
    const req = {
      body: { category: "Invalida" },
      user: { userId: "user-1", username: "usuario1" }
    } as unknown as Request;

    const res = createMockResponse();

    createExpense(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Categoría inválida"
      })
    );
    expect(mockedService.createExpense).not.toHaveBeenCalled();
  });

  test("crea un gasto y devuelve 201", () => {
    const reqBody = {
      amount: 100,
      category: "Comida",
      date: "2025-01-01",
      description: "Almuerzo"
    };

    const req = {
      body: reqBody,
      user: { userId: "user-1", username: "usuario1" }
    } as unknown as Request;

    const res = createMockResponse();

    const created = { id: "1", ...reqBody } as any;
    mockedService.createExpense.mockReturnValue(created);

    createExpense(req, res);

    expect(mockedService.createExpense).toHaveBeenCalledWith(
      "user-1",
      reqBody
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });
});

describe("expense.controller - updateExpense", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("devuelve 400 si la categoría es inválida", () => {
    const req = {
      params: { id: "1" },
      body: { category: "Invalida" },
      user: { userId: "user-1", username: "usuario1" }
    } as unknown as Request;

    const res = createMockResponse();

    updateExpense(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Categoría inválida"
      })
    );
    expect(mockedService.updateExpense).not.toHaveBeenCalled();
  });

  test("devuelve 404 si no encuentra el gasto", () => {
    const req = {
      params: { id: "1" },
      body: { amount: 50 },
      user: { userId: "user-1", username: "usuario1" }
    } as unknown as Request;

    const res = createMockResponse();

    mockedService.updateExpense.mockReturnValue(null);

    updateExpense(req, res);

    expect(mockedService.updateExpense).toHaveBeenCalledWith(
      "user-1",
      "1",
      { amount: 50 }
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Expense not found" });
  });

  test("actualiza un gasto existente", () => {
    const req = {
      params: { id: "1" },
      body: { amount: 80 },
      user: { userId: "user-1", username: "usuario1" }
    } as unknown as Request;

    const res = createMockResponse();

    const updated = { id: "1", amount: 80 } as any;
    mockedService.updateExpense.mockReturnValue(updated);

    updateExpense(req, res);

    expect(mockedService.updateExpense).toHaveBeenCalledWith(
      "user-1",
      "1",
      { amount: 80 }
    );
    expect(res.status).not.toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(updated);
  });
});

describe("expense.controller - deleteExpense", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("devuelve 404 si no encuentra el gasto", () => {
    const req = {
      params: { id: "1" },
      user: { userId: "user-1", username: "usuario1" }
    } as unknown as Request;

    const res = createMockResponse();

    mockedService.deleteExpense.mockReturnValue(false);

    deleteExpense(req, res);

    expect(mockedService.deleteExpense).toHaveBeenCalledWith("user-1", "1");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Expense not found" });
  });

  test("elimina un gasto existente", () => {
    const req = {
      params: { id: "1" },
      user: { userId: "user-1", username: "usuario1" }
    } as unknown as Request;

    const res = createMockResponse();

    mockedService.deleteExpense.mockReturnValue(true);

    deleteExpense(req, res);

    expect(mockedService.deleteExpense).toHaveBeenCalledWith("user-1", "1");
    expect(res.json).toHaveBeenCalledWith({ message: "Expense deleted" });
  });
});

describe("expense.controller - getSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("devuelve el resumen del servicio", () => {
    const req = {
      user: { userId: "user-1", username: "usuario1" }
    } as unknown as Request;
    const res = createMockResponse();

    const summary = {
      total: 100,
      byCategory: { Comida: 100 }
    };

    mockedService.getSummary.mockReturnValue(summary as any);

    getSummary(req, res);

    expect(mockedService.getSummary).toHaveBeenCalledWith("user-1");
    expect(res.json).toHaveBeenCalledWith(summary);
  });
});
