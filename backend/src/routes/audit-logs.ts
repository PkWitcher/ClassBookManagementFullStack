import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Get all audit logs (admin only)
router.get("/", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    res.json(auditLogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch audit logs",
      },
    });
  }
});

export default router;
