import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { users } from "../data/users";
import { User } from "../models/user.model";

export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const SALT_ROUNDS = 10;

export interface AuthPayload {
  userId: string;
  username: string;
}

export const findUserByUsername = (username: string): User | undefined => {
  return users.find(
    u => u.username.toLowerCase() === username.toLowerCase()
  );
};

export const registerUser = async (
  username: string,
  password: string
): Promise<User> => {
  const existing = findUserByUsername(username);
  if (existing) {
    throw new Error("USERNAME_TAKEN");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser: User = {
    id: uuid(),
    username,
    passwordHash
  };

  users.push(newUser);

  return newUser;
};

export const validatePassword = async (
  user: User,
  password: string
): Promise<boolean> => {
  return bcrypt.compare(password, user.passwordHash);
};

export const generateToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
};
