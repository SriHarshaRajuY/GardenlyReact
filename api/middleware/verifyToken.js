// api/middleware/verifyToken.js
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return next(errorHandler(401, "Unauthorized"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(errorHandler(403, "Invalid token"));
  }
};

export const requireSeller = (req, res, next) => {
  if (req.user.role !== "seller") return next(errorHandler(403, "Seller required"));
  next();
};

export const requireExpert = (req, res, next) => {
  if (req.user.role !== "expert") return next(errorHandler(403, "Expert required"));
  next();
};

// server/middleware/verifyToken.js (MODIFIED - ADD THIS EXPORT IF NOT PRESENT; ASSUMING FULL FILE NOT GIVEN, ADD:)
export const requireBuyer = (req, res, next) => {
  if (req.user.role !== 'buyer') {
    return next({ statusCode: 403, message: 'Access denied. Buyers only.' });
  }
  next();
};