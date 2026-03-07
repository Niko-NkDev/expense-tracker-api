export type ExpenseCategory =
  | "Comida"
  | "Transporte"
  | "Entretenimiento"
  | "Vivienda"
  | "Salud";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Comida",
  "Transporte",
  "Entretenimiento",
  "Vivienda",
  "Salud"
];

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  description?: string;
}