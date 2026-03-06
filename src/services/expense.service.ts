import { v4 as uuid } from "uuid";
import { Expense, ExpenseCategory } from "../models/expense.model";
import { expenses } from "../data/database";

export const getAllExpenses = (
  category?: ExpenseCategory,
  startDate?: string,
  endDate?: string
): Expense[] => {

  let result = [...expenses];

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

export const createExpense = (data: Omit<Expense, "id">): Expense => {

  const newExpense: Expense = {
    id: uuid(),
    ...data
  };

  expenses.push(newExpense);

  return newExpense;
};

export const updateExpense = (
  id: string,
  data: Partial<Expense>
): Expense | null => {

  const index = expenses.findIndex(e => e.id === id);

  if (index === -1) return null;

  expenses[index] = { ...expenses[index], ...data };

  return expenses[index];
};

export const deleteExpense = (id: string): boolean => {

  const index = expenses.findIndex(e => e.id === id);

  if (index === -1) return false;

  expenses.splice(index, 1);

  return true;
};

export const getSummary = () => {

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory: Record<string, number> = {};

  expenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  return {
    total,
    byCategory
  };
};