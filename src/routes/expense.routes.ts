import { Router } from "express";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary
} from "../controllers/expense.controller";

const router = Router();

router.get("/", getExpenses);
router.post("/", createExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);
router.get("/summary", getSummary);

export default router;