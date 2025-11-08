import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Routers
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import productRouter from "./routes/product.route.js";

dotenv.config();

const app = express();

// ==============================================
// 🌿 Directory Setup for Static Files
// ==============================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static images from /public/images
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ==============================================
// 🌿 Middlewares
// ==============================================
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // React frontend
    credentials: true,
  })
);

// ==============================================
// 🌿 Connect MongoDB
// ==============================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ==============================================
// 🌿 Routes
// ==============================================
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);

// ==============================================
// 🌿 Error Handler
// ==============================================
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
  });
});

// ==============================================
// 🌿 Server Start
// ==============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
