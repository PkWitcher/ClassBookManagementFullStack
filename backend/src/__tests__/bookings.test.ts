import request from "supertest";
import app from "../server";
import { prisma, cleanupTestData } from "./setup";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

describe("Bookings Endpoints", () => {
  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let userId: string;
  let classId: string;
  let sessionId: string;
  let bookingId: number;

  beforeEach(async () => {
    await cleanupTestData();

    // Create test users
    const hashedPassword = await bcrypt.hash("password123", 10);

    const timestamp = Date.now();
    const admin = await prisma.user.create({
      data: {
        email: `admin-${timestamp}@example.com`,
        password: hashedPassword,
        role: "Admin",
      },
    });
    adminId = admin.id;

    const user = await prisma.user.create({
      data: {
        email: `user-${timestamp}@example.com`,
        password: hashedPassword,
        role: "user",
      },
    });
    userId = user.id;

    // Create tokens
    adminToken = jwt.sign(
      {
        userId: adminId,
        role: "Admin",
        email: `admin-${timestamp}@example.com`,
      },
      JWT_SECRET
    );
    userToken = jwt.sign(
      { userId: userId, role: "user", email: `user-${timestamp}@example.com` },
      JWT_SECRET
    );

    // Create test class and session
    const testClass = await prisma.class.create({
      data: {
        name: "Test Class",
        description: "A test class for unit testing",
      },
    });
    classId = testClass.id;

    const session = await prisma.session.create({
      data: {
        classId: classId,
        startTime: new Date("2024-12-31T10:00:00.000Z"),
        endTime: new Date("2024-12-31T12:00:00.000Z"),
        capacity: 10,
      },
    });
    sessionId = session.id;

    // Create a test booking
    const booking = await prisma.booking.create({
      data: {
        userId: userId,
        sessionId: sessionId,
      },
    });
    bookingId = booking.id;
  }, 10000);

  describe("GET /bookings", () => {
    it("should return user bookings for regular user", async () => {
      const response = await request(app)
        .get("/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty("id", bookingId);
      expect(response.body[0]).toHaveProperty("session");
      expect(response.body[0].session).toHaveProperty("class");
    });

    it("should return all bookings for admin", async () => {
      const response = await request(app)
        .get("/bookings/all")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty("user");
      expect(response.body[0].user).toHaveProperty("email");
    });

    it("should return forbidden for non-admin accessing all bookings", async () => {
      const response = await request(app)
        .get("/bookings/all")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code", "FORBIDDEN");
    });

    it("should return unauthorized without token", async () => {
      const response = await request(app).get("/bookings").expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("DELETE /bookings/:id", () => {
    it("should cancel booking successfully", async () => {
      const response = await request(app)
        .delete(`/bookings/${bookingId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Booking cancelled successfully"
      );
      expect(response.body).toHaveProperty("bookingId", bookingId.toString());

      // Verify booking was deleted
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });
      expect(booking).toBeNull();

      // Verify audit log was created
      const auditLog = await prisma.auditLog.findFirst({
        where: { entityId: bookingId.toString(), action: "CANCEL" },
      });
      expect(auditLog).toBeTruthy();
    });

    it("should allow admin to cancel any booking", async () => {
      const response = await request(app)
        .delete(`/bookings/${bookingId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Booking cancelled successfully"
      );
    });

    it("should return forbidden for user trying to cancel another user booking", async () => {
      // Create another user and booking
      const hashedPassword = await bcrypt.hash("password123", 10);
      const anotherUser = await prisma.user.create({
        data: {
          email: `another-${Date.now()}@example.com`,
          password: hashedPassword,
          role: "user",
        },
      });

      const anotherBooking = await prisma.booking.create({
        data: {
          userId: anotherUser.id,
          sessionId: sessionId,
        },
      });

      const response = await request(app)
        .delete(`/bookings/${anotherBooking.id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code", "FORBIDDEN");
    });

    it("should return not found for non-existent booking", async () => {
      const response = await request(app)
        .delete("/bookings/99999")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code", "NOT_FOUND");
    });

    it("should return invalid ID for malformed booking ID", async () => {
      const response = await request(app)
        .delete("/bookings/invalid")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code", "INVALID_ID");
    });
  });

  describe("GET /bookings/stats", () => {
    it("should return booking statistics for admin", async () => {
      const response = await request(app)
        .get("/bookings/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("totalBookings");
      expect(response.body).toHaveProperty("activeBookings");
      expect(response.body).toHaveProperty("cancelledBookings");
    });

    it("should return forbidden for non-admin", async () => {
      const response = await request(app)
        .get("/bookings/stats")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code", "FORBIDDEN");
    });
  });
});
