import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to clean up test data
export const cleanupTestData = async () => {
  // Only delete test data with very specific patterns to avoid deleting real data
  // Order matters: delete in reverse dependency order to avoid foreign key constraints

  // 1. Delete audit logs first (no dependencies)
  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        {
          user: {
            email: {
              startsWith: "test-",
              endsWith: "@example.com",
            },
          },
        },
        {
          user: {
            email: {
              startsWith: "admin-",
              endsWith: "@example.com",
            },
          },
        },
        {
          user: {
            email: {
              startsWith: "user-",
              endsWith: "@example.com",
            },
          },
        },
        {
          user: {
            email: {
              startsWith: "login-",
              endsWith: "@example.com",
            },
          },
        },
        {
          user: {
            email: {
              startsWith: "duplicate-",
              endsWith: "@example.com",
            },
          },
        },
        {
          user: {
            email: {
              startsWith: "another-",
              endsWith: "@example.com",
            },
          },
        },
      ],
    },
  });

  // 2. Delete bookings (depends on users and sessions)
  await prisma.booking.deleteMany({
    where: {
      OR: [
        {
          user: {
            email: {
              startsWith: "test-",
              endsWith: "@example.com",
            },
          },
        },
        {
          user: {
            email: {
              startsWith: "admin-",
              endsWith: "@example.com",
            },
          },
        },
        {
          user: {
            email: {
              startsWith: "user-",
              endsWith: "@example.com",
            },
          },
        },
        {
          user: {
            email: {
              startsWith: "login-",
              endsWith: "@example.com",
            },
          },
        },
        {
          user: {
            email: {
              startsWith: "duplicate-",
              endsWith: "@example.com",
            },
          },
        },
        {
          user: {
            email: {
              startsWith: "another-",
              endsWith: "@example.com",
            },
          },
        },
      ],
    },
  });

  // 3. Delete sessions (depends on classes)
  await prisma.session.deleteMany({
    where: {
      class: {
        name: {
          in: [
            "Test Class",
            "Advanced React Development",
            "Node.js Backend Development",
          ],
        },
      },
    },
  });

  // 4. Delete test classes
  await prisma.class.deleteMany({
    where: {
      name: {
        in: [
          "Test Class",
          "Advanced React Development",
          "Node.js Backend Development",
        ],
      },
    },
  });

  // 5. Delete test users (no dependencies)
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { startsWith: "test-", endsWith: "@example.com" } },
        { email: { startsWith: "admin-", endsWith: "@example.com" } },
        { email: { startsWith: "user-", endsWith: "@example.com" } },
        { email: { startsWith: "login-", endsWith: "@example.com" } },
        { email: { startsWith: "duplicate-", endsWith: "@example.com" } },
        { email: { startsWith: "another-", endsWith: "@example.com" } },
      ],
    },
  });
};

// Global test setup
beforeAll(async () => {
  // Clean up all test data before running tests
  await cleanupTestData();
}, 30000);

afterAll(async () => {
  // Clean up all test data after running tests
  await cleanupTestData();
  await prisma.$disconnect();
}, 30000);

export { prisma };
