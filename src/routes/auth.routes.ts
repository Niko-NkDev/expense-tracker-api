import { Router } from "express";
import {
	register,
	login,
	listUsers,
	getBalance,
	updateBalance
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", listUsers);
router.get("/balance", authMiddleware, getBalance);
router.put("/balance", authMiddleware, updateBalance);

export default router;
