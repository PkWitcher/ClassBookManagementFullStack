import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import sessionRoutes from "./routes/sessions";
import classRoutes from "./routes/classes";
import bookingRoutes from "./routes/bookings";
import auditLogRoutes from "./routes/audit-logs";
import healthRoutes from "./routes/health";

dotenv.config();
const app = express();
const port = process.env.PORT || 5001;

// ----------------------
// CORS middleware (must be first)
// ----------------------
app.use(
  cors({
    origin: [
      "https://class-book-management-full-stack.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// ----------------------
// Body parser
// ----------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------
// Routes
// ----------------------
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/sessions", sessionRoutes);
app.use("/classes", classRoutes);
app.use("/bookings", bookingRoutes);
app.use("/audit-logs", auditLogRoutes);

// ----------------------
// Start server
// ----------------------
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () =>
    console.log(`Server running at http://localhost:${port}`)
  );
}

export default app;
