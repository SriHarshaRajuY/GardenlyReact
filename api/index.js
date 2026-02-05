// api/index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// ← NEW: Third-party middlewares
import helmet from "helmet";
import logger from "./middleware/logger.js";   // ← Application-level logging

import ticketRoute from "./routes/ticket.route.js";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js";
import adminRouter from "./routes/admin.route.js";

import upload from "./upload.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

// ← NEW: Application-level + Third-party middlewares (added here)
app.use(helmet());                    // Security headers (Third-party)
app.use(logger);                      // Morgan logging (Application-level)
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Static files
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ← NEW: Serve uploaded files publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes (Router-level middleware already perfectly used in your route files)
app.use("/api/tickets", ticketRoute);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin", adminRouter);

// Your existing global error handler (Error-handling middleware)
app.use((err, req, res, next) => {
  console.error("Error middleware:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ success: false, status: statusCode, message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export { upload };