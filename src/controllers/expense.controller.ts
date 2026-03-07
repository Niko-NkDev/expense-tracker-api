import { Request, Response } from "express";
import * as expenseService from "../services/expense.service";
import { ExpenseCategory, EXPENSE_CATEGORIES } from "../models/expense.model";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getExpenses = (req: Request, res: Response) => {

  const { user } = req as AuthRequest;

  if (!user) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const { category, startDate, endDate } = req.query;

  let categoryFilter: ExpenseCategory | undefined;

  if (category) {
    const categoryStr = String(category);

    if (!EXPENSE_CATEGORIES.includes(categoryStr as ExpenseCategory)) {
      return res.status(400).json({
        message: "Categoría inválida",
        allowedCategories: EXPENSE_CATEGORIES
      });
    }

    categoryFilter = categoryStr as ExpenseCategory;
  }

  const expenses = expenseService.getAllExpenses(
    user.userId,
    categoryFilter,
    startDate as string,
    endDate as string
  );

  res.json(expenses);
};

export const createExpense = (req: Request, res: Response) => {

  const { user } = req as AuthRequest;

  if (!user) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const { category } = req.body;

  if (!EXPENSE_CATEGORIES.includes(category as ExpenseCategory)) {
    return res.status(400).json({
      message: "Categoría inválida",
      allowedCategories: EXPENSE_CATEGORIES
    });
  }

  const expense = expenseService.createExpense(user.userId, req.body);

  res.status(201).json(expense);
};

export const updateExpense = (req: Request, res: Response) => {

  const { user } = req as AuthRequest;

  if (!user) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const id = req.params.id as string;

  if (req.body.category) {
    const category = req.body.category as ExpenseCategory;

    if (!EXPENSE_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Categoría inválida",
        allowedCategories: EXPENSE_CATEGORIES
      });
    }
  }

  const updated = expenseService.updateExpense(user.userId, id, req.body);

  if (!updated) {
    return res.status(404).json({ message: "Expense not found" });
  }

  res.json(updated);
};

export const deleteExpense = (req: Request, res: Response) => {

  const { user } = req as AuthRequest;

  if (!user) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const id = req.params.id as string;

  const deleted = expenseService.deleteExpense(user.userId, id);

  if (!deleted) {
    return res.status(404).json({ message: "Expense not found" });
  }

  res.json({ message: "Expense deleted" });
};

export const getSummary = (req: Request, res: Response) => {

  const { user } = req as AuthRequest;

  if (!user) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const summary = expenseService.getSummary(user.userId);

  res.json(summary);
};