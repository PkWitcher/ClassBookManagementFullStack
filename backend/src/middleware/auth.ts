import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";



const JWT_SECRET = process.env.JWT_SECRET || "supersecret";



// Extend Express Request type

export interface AuthRequest extends Request {

user?: { userId: string; role: string; email: string };

}



export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {

const authHeader = req.headers.authorization;



if (!authHeader) return res.status(401).json({ error: "No token provided" });



const token = authHeader.split(" ")[1];



try {
const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; email: string };
req.user = decoded; // ✅ Attach user
next();
} catch (err) {
res.status(401).json({ error: "Invalid token" });
}
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: "Admin access required",
      },
    });
  }
  next();
};