import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDirectory = path.join(__dirname, "../logs");

// Rotating file stream (creates the folder automatically)
const accessLogStream = createStream("access.log", {
  interval: "1d",        // new file every day
  path: logDirectory,
  compress: "gzip",      // old files get .gz
  size: "10M",           // rotate also if >10 MB
  maxFiles: 14,          // keep only last 14 days
});

// ALWAYS write full logs to file
const fileLogger = morgan("combined", { stream: accessLogStream });

// Show nice colored logs in terminal ONLY during development
const consoleLogger = morgan("dev");

// Combined middleware
const logger = (req, res, next) => {
  fileLogger(req, res, () => {});           // always to file
  if (process.env.NODE_ENV !== "production") {
    consoleLogger(req, res, next);          // dev console
  } else {
    next();
  }
};

export default logger;