// server/middleware/verifyToken.js
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
  if (req.user.role !== "seller") {
    return next(errorHandler(403, "Seller access required"));
  }
  next();
};