import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import interviewRouter from "./routes/interview.routes.js";
import cookieParser from "cookie-parser";

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRouter);

export default app;
