import express, { Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = express.Router();

// Admin middleware to check if user is admin
const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({ 
      error: { 
        code: "FORBIDDEN", 
        message: "Admin access required" 
      } 
    });
  }
  next();
};

// Get all classes (public)
router.get("/", async (_, res) => {
  try {
    const classes = await prisma.class.findMany({
      include: { sessions: true }
    });
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: { 
        code: "INTERNAL_ERROR", 
        message: "Failed to fetch classes" 
      } 
    });
  }
});

// Create a new class (admin only)
router.post("/", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        error: { 
          code: "VALIDATION_ERROR", 
          message: "Class name is required" 
        } 
      });
    }

    const newClass = await prisma.class.create({
      data: { name, description }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entity: "Class",
        entityId: newClass.id,
        action: "CREATE_CLASS",
        userId: req.user!.userId,
        details: { name, description }
      }
    });

    res.status(201).json(newClass);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: { 
        code: "INTERNAL_ERROR", 
        message: "Failed to create class" 
      } 
    });
  }
});

// Get a specific class with sessions
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const classData = await prisma.class.findUnique({
      where: { id },
      include: { 
        sessions: {
          include: { bookings: true }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({ 
        error: { 
          code: "NOT_FOUND", 
          message: "Class not found" 
        } 
      });
    }

    res.json(classData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: { 
        code: "INTERNAL_ERROR", 
        message: "Failed to fetch class" 
      } 
    });
  }
});

export default router;
