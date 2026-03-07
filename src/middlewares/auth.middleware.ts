import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthPayload, JWT_SECRET } from "../services/auth.service";

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    return next();
  } catch (error) {
    console.error("Error al verificar token:", error);
    return res.status(401).json({ message: "Token inválido" });
  }
};
