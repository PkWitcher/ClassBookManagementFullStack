import express, { Response } from "express";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = express.Router();

// Get user's bookings
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ 
        error: { 
          code: "UNAUTHORIZED", 
          message: "User not authenticated" 
        } 
      });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { 
        session: { 
          include: { class: true } 
        } 
      },
      orderBy: { bookedAt: 'desc' }
    });

    // Format the response to match frontend expectations
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      session: {
        class: {
          name: booking.session.class.name,
        },
        dateTime: booking.session.startTime.toISOString(), // Use startTime as dateTime
      },
      user: {
        email: req.user?.email || 'Unknown',
        role: req.user?.role || 'Unknown',
      },
      bookedAt: booking.bookedAt.toISOString(),
    }));

    res.json(formattedBookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: { 
        code: "INTERNAL_ERROR", 
        message: "Failed to fetch bookings" 
      } 
    });
  }
});

// Get all bookings (admin only)
router.get("/all", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "Admin") {
      return res.status(403).json({ 
        error: { 
          code: "FORBIDDEN", 
          message: "Admin access required" 
        } 
      });
    }

    const bookings = await prisma.booking.findMany({
      include: { 
        user: {
          select: {
            email: true,
            role: true,
          }
        },
        session: { 
          include: { class: true } 
        } 
      },
      orderBy: { bookedAt: 'desc' }
    });

    // Format the response to match frontend expectations
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      session: {
        class: {
          name: booking.session.class.name,
        },
        dateTime: booking.session.startTime.toISOString(), // Use startTime as dateTime
      },
      user: {
        email: booking.user.email,
        role: booking.user.role,
      },
      bookedAt: booking.bookedAt.toISOString(),
    }));

    res.json(formattedBookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: { 
        code: "INTERNAL_ERROR", 
        message: "Failed to fetch all bookings" 
      } 
    });
  }
});

// Cancel a booking
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ 
        error: { 
          code: "UNAUTHORIZED", 
          message: "User not authenticated" 
        } 
      });
    }

    // Parse the booking ID as integer since database now uses integer IDs
    const bookingIdInt = parseInt(bookingId);
    
    if (isNaN(bookingIdInt)) {
      return res.status(400).json({ 
        error: { 
          code: "INVALID_ID", 
          message: "Invalid booking ID format" 
        } 
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingIdInt },
      include: { session: true }
    });

    if (!booking) {
      return res.status(404).json({ 
        error: { 
          code: "NOT_FOUND", 
          message: "Booking not found" 
        } 
      });
    }

    // Check if user owns the booking or is admin
    if (booking.userId !== userId && req.user?.role !== "Admin") {
      return res.status(403).json({ 
        error: { 
          code: "FORBIDDEN", 
          message: "You can only cancel your own bookings" 
        } 
      });
    }

    // Delete the booking
    await prisma.booking.delete({
      where: { id: bookingIdInt }
    });

    // Create audit log - convert integer ID to string for entityId
    await prisma.auditLog.create({
      data: {
        entity: "Booking",
        entityId: String(bookingIdInt), // Convert Int to String for audit log
        action: "CANCEL",
        userId,
        details: { 
          sessionId: booking.sessionId,
          originalUserId: booking.userId,
          databaseId: booking.id
        }
      }
    });

    res.json({ 
      message: "Booking cancelled successfully",
      bookingId: String(bookingIdInt)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: { 
        code: "INTERNAL_ERROR", 
        message: "Failed to cancel booking" 
      } 
    });
  }
});

// Get booking statistics (admin only)
router.get("/stats", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "Admin") {
      return res.status(403).json({ 
        error: { 
          code: "FORBIDDEN", 
          message: "Admin access required" 
        } 
      });
    }

    const totalBookings = await prisma.booking.count();
    const activeBookings = await prisma.booking.count({
      where: { status: "booked" }
    });
    const cancelledBookings = await prisma.booking.count({
      where: { status: "cancelled" }
    });

    res.json({
      totalBookings,
      activeBookings,
      cancelledBookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: { 
        code: "INTERNAL_ERROR", 
        message: "Failed to fetch booking statistics" 
      } 
    });
  }
});

export default router;
