// api/index.js
import ticketRoute from "./routes/ticket.route.js";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js"; // ✅ orders (billing + OTP)
import upload from "./upload.js";
import debugRouter from "./routes/debug.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env: try the expected location, but fall back to other likely places
import fs from "fs";

const tryLoadEnv = (candidates) => {
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        dotenv.config({ path: p });
        console.log(`[dotenv] loaded ${p}`);
        return p;
      }
    } catch (e) {
      // ignore
    }
  }
  // final attempt without path (defaults to process.cwd())
  dotenv.config();
  return null;
};

const envCandidates = [
  path.join(__dirname, "..", ".env"), // api/../.env
  path.join(__dirname, "..", "..", ".env"), // api/../../.env (repo root)
  path.join(process.cwd(), ".env"),
];
const loadedEnvPath = tryLoadEnv(envCandidates);
if (!loadedEnvPath) console.warn("[dotenv] no .env file found in candidates, falling back to default env");


const app = express();

// Serve images (product, uploads, etc.)
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ---------- ROUTES ----------
app.use("/api/tickets", ticketRoute);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter); // ✅ ORDER ROUTES
app.use("/api/debug", debugRouter);

// ---------- DB CONNECTION ----------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// Debug: log whether important envs are loaded (do not print secrets)
console.log("[debug] MONGO_URI present:", typeof process.env.MONGO_URI === 'string' && process.env.MONGO_URI.length > 0);
console.log("[debug] EMAIL_USER present:", !!process.env.EMAIL_USER);

// ---------- GLOBAL ERROR HANDLER ----------
app.use((err, req, res, next) => {
  console.error("Error middleware:", err); // helpful for debugging
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ success: false, status: statusCode, message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export { upload };
