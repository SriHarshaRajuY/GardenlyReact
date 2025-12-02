// api/middleware/verifyToken.js
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

export const verifyToken = (req, res, next) => {
  // use optional chaining so it won't crash if req.cookies is undefined
  const token = req.cookies?.access_token;

  if (!token) return next(errorHandler(401, "Unauthorized"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id, username, role (lowercase) }
    req.user = decoded;
    next();
  } catch (err) {
    next(errorHandler(403, "Invalid token"));
  }
};

export const requireSeller = (req, res, next) => {
  if (req.user.role !== "seller")
    return next(errorHandler(403, "Seller required"));
  next();
};

export const requireExpert = (req, res, next) => {
  if (req.user.role !== "expert")
    return next(errorHandler(403, "Expert required"));
  next();
};

export const requireBuyer = (req, res, next) => {
  if (req.user.role !== "buyer") {
    return next(errorHandler(403, "Access denied. Buyers only."));
  }
  next();
};

export const requireManager = (req, res, next) => {
  if (req.user.role !== "manager") return next(errorHandler(403, "Manager required"));
  next();
};

export const requireAgent = (req, res, next) => {
  if (req.user.role !== "agent") return next(errorHandler(403, "Agent required"));
  next();
};
