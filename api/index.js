import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import { Server } from "socket.io";
import { createServer } from "http";
import logger, { errorLogger } from "./middleware/logger.js";
import ticketRoute from "./routes/ticket.route.js";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js";
import adminRouter from "./routes/admin.route.js";
import sellerRouter from "./routes/seller.route.js";
import customRequestRoute from "./routes/customRequest.route.js";
import blogRoute from "./routes/blog.route.js";
import communityRoute from "./routes/community.route.js";
import upload from "./upload.js";
import { connectRedis } from "./utils/cache.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

app.use(helmet());
app.use(logger);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["X-Redis-Cache"],
  })
);

app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

import { createSwaggerRouter } from "./config/swagger.js";

app.use("/api-docs", createSwaggerRouter());

app.get("/api/redis-health", async (req, res) => {
  const { getRedisClient } = await import("./utils/cache.js");
  const client = getRedisClient();
  try {
    const ping = await client.ping();
    res.json({ success: true, status: "Connected", ping });
  } catch (err) {
    res.status(500).json({ success: false, status: "Disconnected", error: err.message });
  }
});

app.use("/api/tickets", ticketRoute);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin", adminRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/custom-requests", customRequestRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/community", communityRoute);


// Generic Image Upload (Cloudinary)
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  res.status(200).json({ success: true, url: req.file.path });
});


// Socket.io logic
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  
  socket.on("join_post", (communityId) => {
    socket.join(communityId);
    console.log(`User joined community: ${communityId}`);
  });

  socket.on("new_post", (data) => {
    socket.to(data.communityId).emit("receive_post", data);
  });

  socket.on("new_comment", (data) => {
    socket.to(data.communityId).emit("receive_comment", data);
  });

  socket.on("new_like", (data) => {
    socket.to(data.communityId).emit("receive_like", data);
  });


  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.use(errorLogger);
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "gardenly" });
    console.log("🟢 MongoDB connected");
    await connectRedis();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
}

startServer();
export { upload };

