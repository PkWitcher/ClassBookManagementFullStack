import request from "supertest";
import app from "../server";
import { prisma, cleanupTestData } from "./setup";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

describe("Sessions Endpoints", () => {
  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let userId: string;
  let classId: string;
  let sessionId: string;

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

    // Create test class
    const testClass = await prisma.class.create({
      data: {
        name: "Test Class",
        description: "A test class for unit testing",
      },
    });
    classId = testClass.id;
  }, 10000);

  describe("POST /sessions", () => {
    it("should create a new session successfully (admin)", async () => {
      const sessionData = {
        classId: classId,
        dateTime: "2024-12-31T10:00:00.000Z",
        capacity: 10,
      };

      const response = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(sessionData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("classId", classId);
      expect(response.body).toHaveProperty("capacity", 10);
      sessionId = response.body.id;

      // Verify audit log was created
      const auditLog = await prisma.auditLog.findFirst({
        where: { entityId: sessionId, action: "CREATE_SESSION" },
      });
      expect(auditLog).toBeTruthy();
    });

    it("should return validation error for missing fields", async () => {
      const response = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ classId: classId })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code", "VALIDATION_ERROR");
    });

    it("should return forbidden for non-admin users", async () => {
      const sessionData = {
        classId: classId,
        dateTime: "2024-12-31T10:00:00.000Z",
        capacity: 10,
      };

      const response = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${userToken}`)
        .send(sessionData)
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code", "FORBIDDEN");
    });
  });

  describe("POST /sessions/:id/book", () => {
    beforeEach(async () => {
      // Create a test session
      const session = await prisma.session.create({
        data: {
          classId: classId,
          startTime: new Date("2024-12-31T10:00:00.000Z"),
          endTime: new Date("2024-12-31T12:00:00.000Z"),
          capacity: 2,
        },
      });
      sessionId = session.id;
    });

    it("should book a session successfully", async () => {
      const response = await request(app)
        .post(`/sessions/${sessionId}/book`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("userId", userId);
      expect(response.body).toHaveProperty("sessionId", sessionId);

      // Verify audit log was created
      const auditLog = await prisma.auditLog.findFirst({
        where: { entityId: response.body.id.toString(), action: "BOOK" },
      });
      expect(auditLog).toBeTruthy();
    });

    it("should return capacity exceeded error when session is full", async () => {
      // Fill up the session (capacity = 2)
      await prisma.booking.create({
        data: { userId: adminId, sessionId: sessionId },
      });
      await prisma.booking.create({
        data: { userId: userId, sessionId: sessionId },
      });

      // Try to book when full
      const response = await request(app)
        .post(`/sessions/${sessionId}/book`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(409);

      expect(response.body).toHaveProperty("error");
    });

    it("should return double booking error for same user", async () => {
      // Book once
      await request(app)
        .post(`/sessions/${sessionId}/book`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(201);

      // Try to book again
      const response = await request(app)
        .post(`/sessions/${sessionId}/book`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(409);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code", "DOUBLE_BOOKING");
    });

    it("should return unauthorized without token", async () => {
      const response = await request(app)
        .post(`/sessions/${sessionId}/book`)
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /sessions", () => {
    it("should return all sessions (public endpoint)", async () => {
      // Create test sessions
      await prisma.session.createMany({
        data: [
          {
            classId: classId,
            startTime: new Date("2024-12-31T10:00:00.000Z"),
            endTime: new Date("2024-12-31T12:00:00.000Z"),
            capacity: 10,
          },
          {
            classId: classId,
            startTime: new Date("2024-12-31T14:00:00.000Z"),
            endTime: new Date("2024-12-31T16:00:00.000Z"),
            capacity: 5,
          },
        ],
      });

      const response = await request(app).get("/sessions").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0]).toHaveProperty("class");
      expect(response.body[0]).toHaveProperty("availableSeats");
    });
  });
});
