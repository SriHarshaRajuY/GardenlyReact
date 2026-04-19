// api/utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./error.js";

// ✅ Load .env from project root (two levels up from /utils)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Read and sanitize env values
const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();

console.log("📧 Mailer config check:");
console.log("  EMAIL_USER =", JSON.stringify(emailUser));
console.log("  EMAIL_PASS exists? ", !!emailPass);

if (!emailUser || !emailPass) {
  console.error(
    "⚠️ EMAIL_USER or EMAIL_PASS missing in environment. Mailer will fail."
  );
}

// ✅ Explicit Gmail SMTP config (works with app password)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true", // false for 587, true for 465
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// Optional: verify on server start
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Mailer verify failed:", err);
  } else {
    console.log("✅ Mailer ready to send emails");
  }
});

/**
 * Send OTP email
 * @param {string} to - receiver email
 * @param {string|number} otp - otp code
 */
export const sendOtpMail = async (to, otp) => {
  try {
    if (!emailUser || !emailPass) {
      console.error("❌ Cannot send mail: EMAIL_USER or EMAIL_PASS not set");
      throw errorHandler(
        500,
        "Email configuration error. Please contact support."
      );
    }

    const from =
      process.env.MAIL_FROM || `Gardenly Support <${emailUser}>`;

    const info = await transporter.sendMail({
      from,
      to,
      subject: "Your Gardenly order OTP",
      text: `Your OTP for confirming the order is: ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Gardenly Order Verification</h2>
          <p>Hi,</p>
          <p>Your OTP for confirming the order is:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">
            ${otp}
          </p>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you did not try to place an order, you can ignore this email.</p>
          <br/>
          <p>Thanks,<br/>Gardenly Team</p>
        </div>
      `,
    });

    console.log("✅ OTP email sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("Error sending OTP mail:", err);
    throw errorHandler(
      500,
      "Failed to send OTP email. Please try again later."
    );
  }
};

export const sendSignupVerificationMail = async (to, otp) => {
  try {
    const from = process.env.MAIL_FROM;
    await transporter.sendMail({
      from,
      to,
      subject: "Verify your Gardenly account",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Account Verification</h2>
          <p>Your verification code is: <strong style="font-size: 24px;">${otp}</strong></p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error(err);
    throw errorHandler(500, "Failed to send verification email");
  }
};

export const send2FAMail = async (to, otp) => {
  try {
    const from = process.env.MAIL_FROM;
    await transporter.sendMail({
      from,
      to,
      subject: "Gardenly 2FA Login Code",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Login Verification</h2>
          <p>Your 2FA login code is: <strong style="font-size: 24px;">${otp}</strong></p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error(err);
    throw errorHandler(500, "Failed to send 2FA email");
  }
};
export const sendMail = async (to, subject, text) => {
  try {
    const from = process.env.MAIL_FROM || `Gardenly Support <${emailUser}>`;
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.5; white-space: pre-wrap;">${text}</div>`,
    });
    return true;
  } catch (err) {
    console.error("Error sending mail:", err);
    throw errorHandler(500, "Failed to send email.");
  }
};
