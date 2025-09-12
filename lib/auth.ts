import jwt from "jsonwebtoken";
import { config } from "./config";

export interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  role: string;
}

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}
