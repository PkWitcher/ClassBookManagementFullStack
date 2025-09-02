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

// Get all sessions (public)
router.get("/", async (_, res) => {
  try {
    const sessions = await prisma.session.findMany({
      include: { class: true, bookings: true }
    });

    const formatted = sessions.map(s => ({
      id: s.id,
      classId: s.classId,
      class: s.class,
      dateTime: s.startTime.toISOString(), // Use startTime as dateTime for frontend
      capacity: s.capacity,
      bookedSeats: s.bookings.length,
      availableSeats: s.capacity - s.bookings.length
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: { 
        code: "INTERNAL_ERROR", 
        message: "Failed to fetch sessions" 
      } 
    });
  }
});

// Create a new session (admin only)
router.post("/", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    console.log('Session creation request body:', req.body);
    const { classId, dateTime, capacity } = req.body;
    
    if (!classId || !dateTime || !capacity) {
      console.log('Validation failed:', { classId, dateTime, capacity });
      return res.status(400).json({ 
        error: { 
          code: "VALIDATION_ERROR", 
          message: "Class ID, date/time, and capacity are required" 
        } 
      });
    }

    if (capacity <= 0) {
      return res.status(400).json({ 
        error: { 
          code: "VALIDATION_ERROR", 
          message: "Capacity must be greater than 0" 
        } 
      });
    }

    // Check if class exists
    const classExists = await prisma.class.findUnique({ where: { id: classId } });
    if (!classExists) {
      return res.status(404).json({ 
        error: { 
          code: "NOT_FOUND", 
          message: "Class not found" 
        } 
      });
    }

    const startTime = new Date(dateTime);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    const newSession = await prisma.session.create({
      data: { classId, startTime, endTime, capacity }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entity: "Session",
        entityId: newSession.id,
        action: "CREATE_SESSION",
        userId: req.user!.userId,
        details: { classId, dateTime, capacity }
      }
    });

    res.status(201).json(newSession);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: { 
        code: "INTERNAL_ERROR", 
        message: "Failed to create session" 
      } 
    });
  }
});

// Book a session (user)
router.post("/:id/book", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ 
        error: { 
          code: "UNAUTHORIZED", 
          message: "User not authenticated" 
        } 
      });
    }

    // Check if user already has a booking for this session
    const existingBooking = await prisma.booking.findUnique({
      where: { userId_sessionId: { userId, sessionId } }
    });

    if (existingBooking) {
      return res.status(409).json({ 
        error: { 
          code: "DOUBLE_BOOKING", 
          message: "User already has a booking for this session" 
        } 
      });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { bookings: true }
    });

    if (!session) {
      return res.status(404).json({ 
        error: { 
          code: "NOT_FOUND", 
          message: "Session not found" 
        } 
      });
    }

    if (session.bookings.length >= session.capacity) {
      return res.status(409).json({ 
        error: { 
          code: "CAPACITY_EXCEEDED", 
          message: "Session is at full capacity" 
        } 
      });
    }

    const booking = await prisma.booking.create({
      data: { userId, sessionId }
    });

    // Create audit log - convert integer ID to string for entityId
    await prisma.auditLog.create({
      data: {
        entity: "Booking",
        entityId: String(booking.id), // Convert Int to String for audit log
        action: "BOOK",
        userId,
        details: { 
          sessionId, 
          sessionName: session.classId,
          databaseId: booking.id
        }
      }
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: { 
        code: "INTERNAL_ERROR", 
        message: "Failed to create booking" 
      } 
    });
  }
});

export default router;
