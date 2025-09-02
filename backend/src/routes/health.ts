import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// Health check endpoint
router.get("/", async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      database: "connected",
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: "MB",
      },
    };

    res.status(200).json(healthStatus);
  } catch (error) {
    console.error("Health check failed:", error);

    const healthStatus = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    };

    res.status(503).json(healthStatus);
  }
});

// Simple ping endpoint
router.get("/ping", (req: Request, res: Response) => {
  res.status(200).json({
    message: "pong",
    timestamp: new Date().toISOString(),
  });
});

export default router;
