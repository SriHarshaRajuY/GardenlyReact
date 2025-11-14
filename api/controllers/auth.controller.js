// server/controllers/auth.controller.js
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

// ======================
// SIGNUP
// ======================
export const signup = async (req, res, next) => {
  const { username, email, password, role, mobile } = req.body;

  try {
    // Validate required fields
    if (!username || !email || !password || !role || !mobile) {
      return next(errorHandler(400, "All fields are required"));
    }

    // Validation regex
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;

    if (!usernameRegex.test(username)) return next(errorHandler(400, "Invalid username (3-20 chars, letters, numbers, _, -)"));
    if (!passwordRegex.test(password)) return next(errorHandler(400, "Password must be 8+ chars with uppercase, number, special char"));
    if (!emailRegex.test(email)) return next(errorHandler(400, "Invalid email format"));
    if (!mobileRegex.test(mobile)) return next(errorHandler(400, "Mobile must be 10 digits"));
    if (!["Buyer", "Seller", "Admin", "Expert"].includes(role)) return next(errorHandler(400, "Invalid role"));

    // Check for existing user
    const existing = await User.findOne({ $or: [{ username }, { email }, { mobile }] });
    if (existing) return next(errorHandler(400, "User with this username, email, or mobile already exists"));

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      mobile,
    });

    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    next(err);
  }
};

// ======================
// SIGNIN
// ======================
export const signin = async (req, res, next) => {
  const { username, password, role } = req.body;

  try {
    // Validate input
    if (!username || !password || !role) {
      return next(errorHandler(400, "Username, password, and role are required"));
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) return next(errorHandler(404, "User not found"));

    // Validate password
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) return next(errorHandler(401, "Invalid password"));

    // Validate role (case-insensitive)
    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return next(errorHandler(403, "Role mismatch. Please select correct role."));
    }

    // Generate JWT (role in lowercase for consistency)
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role.toLowerCase(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user._doc;

    // Set cookie + return token in JSON
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        token,
        user: userWithoutPassword,
      });

  } catch (err) {
    next(err);
  }
};