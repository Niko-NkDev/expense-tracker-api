import { v4 as uuid } from "uuid";
import { Expense, ExpenseCategory } from "../models/expense.model";
import { expenses } from "../data/database";

export const getAllExpenses = (
  userId: string,
  category?: ExpenseCategory,
  startDate?: string,
  endDate?: string
): Expense[] => {

  let result = expenses.filter(e => e.userId === userId);

  if (category) {
    result = result.filter(e => e.category === category);
  }

  if (startDate && endDate) {
    result = result.filter(e => {
      const expenseDate = new Date(e.date);
      return (
        expenseDate >= new Date(startDate) &&
        expenseDate <= new Date(endDate)
      );
    });
  }

  return result;
};

export const createExpense = (
  userId: string,
  data: Omit<Expense, "id" | "userId">
): Expense => {

  const newExpense: Expense = {
    id: uuid(),
    userId,
    ...data
  };

  expenses.push(newExpense);

  return newExpense;
};

export const updateExpense = (
  userId: string,
  id: string,
  data: Partial<Omit<Expense, "userId">>
): Expense | null => {

  const index = expenses.findIndex(e => e.id === id && e.userId === userId);

  if (index === -1) return null;

  expenses[index] = { ...expenses[index], ...data };

  return expenses[index];
};

export const deleteExpense = (userId: string, id: string): boolean => {

  const index = expenses.findIndex(e => e.id === id && e.userId === userId);

  if (index === -1) return false;

  expenses.splice(index, 1);

  return true;
};

export const getSummary = (userId: string) => {

  const userExpenses = expenses.filter(e => e.userId === userId);

  const total = userExpenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory: Record<string, number> = {};

  userExpenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  return {
    total,
    byCategory
  };
};