import { Request, Response } from "express";
import {
  registerUser,
  findUserByUsername,
  validatePassword,
  generateToken
} from "../services/auth.service";
import { users } from "../data/users";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Usuario y password son requeridos"
      });
    }

    const user = await registerUser(username, password);

    const token = generateToken({ userId: user.id, username: user.username });

    return res.status(201).json({
      id: user.id,
      username: user.username,
      token
    });
  } catch (error: any) {
    if (error.message === "USERNAME_TAKEN") {
      return res
        .status(409)
        .json({ message: "El usuario ya está registrado" });
    }

    console.error("Error en register:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Usuario y password son requeridos"
      });
    }

    const user = findUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isValid = await validatePassword(user, password);

    if (!isValid) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = generateToken({ userId: user.id, username: user.username });

    return res.json({
      id: user.id,
      username: user.username,
      token
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const listUsers = (req: Request, res: Response) => {
  const safeUsers = users.map(user => ({
    id: user.id,
    username: user.username
  }));

  return res.json(safeUsers);
};
