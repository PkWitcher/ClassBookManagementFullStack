import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// ✅ No router-level OPTIONS handling is needed
// ✅ Global cors() middleware already handles preflight

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        error: { 
          code: "VALIDATION_ERROR", 
          message: "Email and password required" 
        } 
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ 
        error: { 
          code: "USER_EXISTS", 
          message: "User already exists" 
        } 
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, role: "user" },
    });

    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: { 
        code: "INTERNAL_ERROR", 
        message: "Registration failed" 
      } 
    });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        error: { 
          code: "VALIDATION_ERROR", 
          message: "Email and password required" 
        } 
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        error: { 
          code: "INVALID_CREDENTIALS", 
          message: "Invalid credentials" 
        } 
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ 
        error: { 
          code: "INVALID_CREDENTIALS", 
          message: "Invalid credentials" 
        } 
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: { 
        code: "INTERNAL_ERROR", 
        message: "Login failed" 
      } 
    });
  }
});

export default router;
