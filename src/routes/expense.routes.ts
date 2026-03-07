import { Router } from "express";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary
} from "../controllers/expense.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getExpenses);
router.post("/", createExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);
router.get("/summary", getSummary);

export default router;