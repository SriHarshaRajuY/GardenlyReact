// api/controllers/auth.controller.js
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { errorHandler } from "../utils/error.js";
import { sendOtpMail } from "../utils/mailer.js";  

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const buildAuthResponse = (res, user) => {
  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role.toLowerCase() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const { password: _, ...userWithoutPassword } = user._doc;

  return res
    .cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({ success: true, token, user: userWithoutPassword });
};

// SIGNUP 
export const signup = async (req, res, next) => {
  const { username, email, password, role, mobile, expertise } = req.body;

  try {
    if (!username || !email || !password || !role || !mobile) {
      return next(errorHandler(400, "All fields are required"));
    }

    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/;
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const mobileRegex = /^\d{10}$/;

    if (!usernameRegex.test(username)) {
      return next(errorHandler(400, "Invalid username (3-20 chars, letters, numbers, _, -)"));
    }
    if (!passwordRegex.test(password)) {
      return next(errorHandler(400, "Password must be 8+ chars with uppercase, number, special char"));
    }
    if (!emailRegex.test(email)) {
      return next(errorHandler(400, "Invalid email format"));
    }
    if (!mobileRegex.test(mobile)) {
      return next(errorHandler(400, "Mobile must be 10 digits"));
    }
    if (!["Buyer", "Seller", "Admin", "Expert"].includes(role)) {
      return next(errorHandler(400, "Invalid role"));
    }

    let finalExpertise = "General";
    if (role === "Expert") {
      const allowed = ["General", "Technical", "Billing"];
      if (!expertise || !allowed.includes(expertise)) {
        return next(errorHandler(400, "Expertise required for Expert role"));
      }
      finalExpertise = expertise;
    }

    const existing = await User.findOne({ $or: [{ username }, { email }, { mobile }] });
    if (existing) {
      return next(errorHandler(400, "User with this username/email/mobile already exists"));
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = new User({
      username, email, password: hashedPassword, role, mobile, expertise: finalExpertise
    });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    next(err);
  }
};

// SIGNIN 
export const signin = async (req, res, next) => {
  const { username, password, role } = req.body;

  try {
    if (!username || !password || !role) {
      return next(errorHandler(400, "Username, password, and role are required"));
    }

    const user = await User.findOne({ username });
    if (!user) return next(errorHandler(404, "User not found"));

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) return next(errorHandler(401, "Invalid password"));

    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return next(errorHandler(403, "Role mismatch. Please select correct role."));
    }

    return buildAuthResponse(res, user);

  } catch (err) {
    next(err);
  }
};

// GOOGLE SIGNIN
export const googleSignin = async (req, res, next) => {
  const { credential, role = "Buyer" } = req.body;

  try {
    if (!credential) {
      return next(errorHandler(400, "Google credential is required"));
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return next(errorHandler(500, "GOOGLE_CLIENT_ID is not configured"));
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase();
    if (!email) {
      return next(errorHandler(400, "Google account email is missing"));
    }

    let user = await User.findOne({ email });

    if (!user) {
      const safeRole = ["Buyer", "Seller", "Admin", "Expert"].includes(role)
        ? role
        : "Buyer";

      const emailPrefix = (email.split("@")[0] || "user")
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 12);

      let username = `${emailPrefix || "user"}_${Math.floor(
        100 + Math.random() * 900
      )}`;
      while (await User.findOne({ username })) {
        username = `${emailPrefix || "user"}_${Math.floor(
          100 + Math.random() * 900
        )}`;
      }

      let mobile = `${Date.now()}`.slice(-10);
      while (await User.findOne({ mobile })) {
        mobile = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      }

      const tempPassword = bcrypt.hashSync(
        `google_${Date.now()}_${Math.random()}`,
        10
      );

      user = await User.create({
        username,
        email,
        password: tempPassword,
        role: safeRole,
        mobile,
        expertise: safeRole === "Expert" ? "General" : "General",
      });
    }

    return buildAuthResponse(res, user);
  } catch (err) {
    return next(errorHandler(401, "Invalid Google token"));
  }
};

// FORGOT PASSWORD - SEND OTP
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) return next(errorHandler(400, "Email is required"));

    const user = await User.findOne({ email });
    if (!user) return next(errorHandler(404, "No account found with this email"));

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpiresAt = expires;
    await user.save();

    await sendOtpMail(email, otp);   // Now works!

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (err) {
    next(err);
  }
};

// VERIFY OTP & RESET PASSWORD
export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return next(errorHandler(400, "Email, OTP, and new password are required"));
    }

    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/.test(newPassword)) {
      return next(errorHandler(400, "Password must be 8+ chars with uppercase, number, special char"));
    }

    const user = await User.findOne({ email });
    if (!user) return next(errorHandler(404, "User not found"));

    if (!user.resetOtp || user.resetOtp !== otp) {
      return next(errorHandler(400, "Invalid OTP"));
    }

    if (user.resetOtpExpiresAt < new Date()) {
      user.resetOtp = undefined;
      user.resetOtpExpiresAt = undefined;
      await user.save();
      return next(errorHandler(400, "OTP expired"));
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now login.",
    });
  } catch (err) {
    next(err);
  }
};