// api/middlewares.js

export const isAuthenticated = (req, res, next) => {
  if (req.session?.user) return next();
  res.status(401).json({ message: "Unauthorized" });
};

export const isSeller = (req, res, next) => {
  if (req.session.user?.role === "Seller") return next();
  res.status(403).json({ message: "Access denied: Seller privileges required" });
};

export const isAdmin = (req, res, next) => {
  if (req.session.user?.role === "Admin") return next();
  res.status(403).json({ message: "Access denied: Admin required" });
};

export const isBuyer = (req, res, next) => {
  if (req.session.user?.role === "Buyer") return next();
  res.status(403).json({ message: "Access denied: Buyer required" });
};

export const isExpert = (req, res, next) => {
  if (req.session.user?.role === "Expert") return next();
  res.status(403).json({ message: "Access denied: Expert required" });
};