// backend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Declare a global variable for PrismaClient in development to prevent
// multiple instances during hot-reloading in Next.js/similar environments.
// For Express, it's generally fine, but this pattern is robust.
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
