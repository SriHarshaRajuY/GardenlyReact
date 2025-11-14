import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

// SIGNUP
export const signup = async (req, res, next) => {
  const { username, email, password, role, mobile } = req.body;

  try {
    if (!username || !email || !password || !role || !mobile) {
      return next(errorHandler(400, "All fields are required"));
    }

    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;

    if (!usernameRegex.test(username)) return next(errorHandler(400, "Invalid username"));
    if (!passwordRegex.test(password)) return next(errorHandler(400, "Invalid password"));
    if (!emailRegex.test(email)) return next(errorHandler(400, "Invalid email"));
    if (!mobileRegex.test(mobile)) return next(errorHandler(400, "Invalid mobile"));
    if (!["Buyer", "Seller", "Admin", "Expert"].includes(role)) return next(errorHandler(400, "Invalid role"));

    const existing = await User.findOne({ $or: [{ username }, { email }, { mobile }] });
    if (existing) return next(errorHandler(400, "User already exists"));

    const hashed = bcrypt.hashSync(password, 10);
    const user = new User({ username, email, password: hashed, role, mobile });
    await user.save();

    res.status(201).json({ message: "User created" });
  } catch (err) {
    next(err);
  }
};

// SIGNIN
export const signin = async (req, res, next) => {
  const { username, password, role } = req.body;

  try {
    if (!username || !password || !role) {
      return next(errorHandler(400, "All fields required"));
    }

    const user = await User.findOne({ username });
    if (!user) return next(errorHandler(404, "User not found"));

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return next(errorHandler(400, "Wrong credentials"));

    if (user.role !== role) return next(errorHandler(400, "Role mismatch"));

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...rest } = user._doc;

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ user: rest });
  } catch (err) {
    next(err);
  }
};