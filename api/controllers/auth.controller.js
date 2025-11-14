import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
  const { username, email, password, role, mobile } = req.body;

  try {
    // Client-side fields check (but server validates fully)
    if (!username || !email || !password || !role || !mobile) {
      return next(errorHandler(400, "All fields are required"));
    }

    // Regex validations matching old project
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;

    if (!usernameRegex.test(username)) {
      return next(errorHandler(400, "Username must be 3-20 characters (letters, numbers, _, - only)"));
    }
    if (!passwordRegex.test(password)) {
      return next(errorHandler(400, "Password must be 8+ characters with at least 1 uppercase, 1 number, and 1 symbol"));
    }
    if (!emailRegex.test(email)) {
      return next(errorHandler(400, "Invalid email format"));
    }
    if (!mobileRegex.test(mobile)) {
      return next(errorHandler(400, "Mobile number must be exactly 10 digits"));
    }
    if (!["Buyer", "Seller", "Admin", "Expert"].includes(role)) {
      return next(errorHandler(400, "Invalid role selected"));
    }

    // Check existing
    const existingUser = await User.findOne({
      $or: [{ username }, { email }, { mobile }],
    });
    if (existingUser) {
      return next(errorHandler(400, "Username, email, or mobile already exists"));
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role, mobile });

    await newUser.save();
    res.status(201).json({ message: "✅ User registered successfully!" });
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  const { username, password, role } = req.body;

  try {
    if (!username || !password || !role) {
      return next(errorHandler(400, "All fields are required"));
    }

    const validUser = await User.findOne({ username });
    if (!validUser) return next(errorHandler(404, "User not found"));

    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(400, "Invalid credentials"));

    if (validUser.role.toLowerCase() !== role.toLowerCase()) {
      return next(errorHandler(400, "Role mismatch"));
    }

    const token = jwt.sign({ id: validUser._id, role: validUser.role }, process.env.JWT_SECRET);

    const { password: pass, ...rest } = validUser._doc;

    res.cookie("access_token", token, {
      httpOnly: true,
      sameSite: "strict",
    }).status(200).json({
      message: "✅ Login successful",
      user: rest,
    });
  } catch (err) {
    next(err);
  }
};