import { expenses } from "../data/database";
import { ExpenseCategory } from "../models/expense.model";
import {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary
} from "./expense.service";

jest.mock("uuid", () => ({
  v4: () => "mock-id-1"
}));

describe("expense.service", () => {
  beforeEach(() => {
    expenses.length = 0;
  });

  test("createExpense agrega un gasto con id generado", () => {
    const data = {
      amount: 100,
      category: "Comida" as ExpenseCategory,
      date: "2025-01-01",
      description: "Almuerzo"
    };

    const created = createExpense("user-1", data);

    expect(created).toMatchObject({
      ...data,
      id: "mock-id-1",
      userId: "user-1"
    });

    expect(expenses).toHaveLength(1);
    expect(expenses[0]).toEqual(created);
  });

  test("getAllExpenses devuelve todos los gastos cuando no hay filtros", () => {
    createExpense("user-1", {
      amount: 50,
      category: "Comida" as ExpenseCategory,
      date: "2025-01-01"
    });
    createExpense("user-1", {
      amount: 20,
      category: "Transporte" as ExpenseCategory,
      date: "2025-01-02"
    });

    const result = getAllExpenses("user-1");

    expect(result).toHaveLength(2);
  });

  test("getAllExpenses filtra por categoría", () => {
    createExpense("user-1", {
      amount: 50,
      category: "Comida" as ExpenseCategory,
      date: "2025-01-01"
    });
    createExpense("user-1", {
      amount: 20,
      category: "Transporte" as ExpenseCategory,
      date: "2025-01-02"
    });

    const result = getAllExpenses("user-1", "Comida");

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("Comida");
  });

  test("getAllExpenses filtra por rango de fechas", () => {
    createExpense("user-1", {
      amount: 50,
      category: "Comida" as ExpenseCategory,
      date: "2025-01-01"
    });
    createExpense("user-1", {
      amount: 20,
      category: "Transporte" as ExpenseCategory,
      date: "2025-01-10"
    });

    const result = getAllExpenses(
      "user-1",
      undefined,
      "2025-01-02",
      "2025-01-09"
    );

    expect(result).toHaveLength(0);

    const result2 = getAllExpenses(
      "user-1",
      undefined,
      "2025-01-01",
      "2025-01-10"
    );
    expect(result2).toHaveLength(2);
  });

  test("updateExpense actualiza un gasto existente", () => {
    const created = createExpense("user-1", {
      amount: 50,
      category: "Comida" as ExpenseCategory,
      date: "2025-01-01"
    });

    const updated = updateExpense("user-1", created.id, { amount: 80 });

    expect(updated).not.toBeNull();
    expect(updated!.amount).toBe(80);
  });

  test("updateExpense devuelve null si no encuentra el gasto", () => {
    const updated = updateExpense("user-1", "id-inexistente", { amount: 80 });

    expect(updated).toBeNull();
  });

  test("deleteExpense elimina un gasto existente", () => {
    const created = createExpense("user-1", {
      amount: 50,
      category: "Comida" as ExpenseCategory,
      date: "2025-01-01"
    });

    const result = deleteExpense("user-1", created.id);

    expect(result).toBe(true);
    expect(expenses).toHaveLength(0);
  });

  test("deleteExpense devuelve false si no encuentra el gasto", () => {
    const result = deleteExpense("user-1", "id-inexistente");

    expect(result).toBe(false);
  });

  test("getSummary calcula total y por categoría", () => {
    createExpense("user-1", {
      amount: 50,
      category: "Comida" as ExpenseCategory,
      date: "2025-01-01"
    });
    createExpense("user-1", {
      amount: 20,
      category: "Comida" as ExpenseCategory,
      date: "2025-01-02"
    });
    createExpense("user-1", {
      amount: 30,
      category: "Transporte" as ExpenseCategory,
      date: "2025-01-03"
    });

    const summary = getSummary("user-1");

    expect(summary.total).toBe(100);
    expect(summary.byCategory["Comida"]).toBe(70);
    expect(summary.byCategory["Transporte"]).toBe(30);
  });
});
