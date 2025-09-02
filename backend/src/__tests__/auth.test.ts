import request from "supertest";
import app from "../server";
import { prisma, cleanupTestData } from "./setup";
import bcrypt from "bcryptjs";

describe("Authentication Endpoints", () => {
  beforeEach(async () => {
    await cleanupTestData();
  }, 10000);

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: "password123",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("email", userData.email);
      expect(response.body).toHaveProperty("role", "user");
      expect(response.body).not.toHaveProperty("password");

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(user).toBeTruthy();
      expect(user?.role).toBe("user");
    });

    it("should return validation error for missing fields", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({ email: "test@example.com" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code", "VALIDATION_ERROR");
      expect(response.body.error).toHaveProperty(
        "message",
        "Email and password required"
      );
    });

    it("should return error for duplicate email", async () => {
      const userData = {
        email: `duplicate-${Date.now()}@example.com`,
        password: "password123",
      };

      // Create first user
      await request(app).post("/auth/register").send(userData).expect(200);

      // Try to create duplicate
      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code", "USER_EXISTS");
    });
  });

  describe("POST /auth/login", () => {
    let loginEmail: string;

    beforeEach(async () => {
      // Create a test user with unique email
      loginEmail = `login-${Date.now()}@example.com`;
      const hashedPassword = await bcrypt.hash("password123", 10);
      await prisma.user.create({
        data: {
          email: loginEmail,
          password: hashedPassword,
          role: "user",
        },
      });
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: loginEmail,
          password: "password123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("email", loginEmail);
      expect(response.body.user).toHaveProperty("role", "user");
    });

    it("should return error for invalid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: loginEmail,
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code", "INVALID_CREDENTIALS");
    });

    it("should return validation error for missing fields", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ email: loginEmail })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code", "VALIDATION_ERROR");
    });
  });
});
