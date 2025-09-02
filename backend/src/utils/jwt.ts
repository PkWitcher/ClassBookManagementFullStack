import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export interface TokenPayload extends JwtPayload {
  userId: string;
  role: "user" | "admin";
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: TokenPayload, expiresIn: string | number = "1d"): string {
  // ✅ cast expiresIn to StringValue if it's a string
  const options: SignOptions = { expiresIn: expiresIn as any }; 
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded as TokenPayload;
}

/**
 * Express middleware
 */
export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
