import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDirectory = path.join(__dirname, "../logs");

// Rotating file stream (creates the folder automatically)
const accessLogStream = createStream("access.log", {
  interval: "1d",           // new file every day
  path: logDirectory,
  compress: "gzip",         // old files get .gz
  size: "10M",              // rotate also if >10 MB
  maxFiles: 14,             // keep only last 14 days
});

// ALWAYS write full logs to file
const fileLogger = morgan("combined", { stream: accessLogStream });

// Show nice colored logs in terminal ONLY during development
const consoleLogger = morgan("dev");

// ─── ERROR LOG STREAM + FORMAT ────────────────────────────────
const errorLogStream = createStream("error.log", {
  interval: "1d",
  path: logDirectory,
  compress: "gzip",
  size: "10M",
  maxFiles: 14,
});

const errorLogFormat = (err, req) => {
  const timestamp = new Date().toISOString();
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const stack = err.stack || "";

  const logEntry = {
    timestamp,
    level: "error",
    status,
    message,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    user: req.user ? (req.user.id || req.user._id || "unknown") : "anonymous",
    stack: process.env.NODE_ENV !== "production" ? stack : undefined,
  };

  return JSON.stringify(logEntry, null, 2) + "\n";
};

// ─── Combined middleware for access logs ───────────────────────
const logger = (req, res, next) => {
  fileLogger(req, res, () => {}); // always to file

  if (process.env.NODE_ENV !== "production") {
    consoleLogger(req, res, next); // dev console
  } else {
    next();
  }
};

// ─── Error logging middleware (must be used after routes) ──────
export const errorLogger = (err, req, res, next) => {
  // Write structured error to rotating error.log
  const logMessage = errorLogFormat(err, req);
  errorLogStream.write(logMessage);

  // Also show in console during development
  if (process.env.NODE_ENV !== "production") {
    console.error("[ERROR LOGGER]", err);
  }

  next(err); // continue to final error handler
};

export default logger;