// api/utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./error.js";

// Ensure we load the project's .env at import time so modules that are
// imported earlier still get the env values (fixes import-order issues).
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load repo-root .env (two levels up from utils): api/utils -> api -> <repo root>
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const hasEmailCreds = !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;
console.log('[mailer debug] EMAIL_USER present:', !!process.env.EMAIL_USER);
console.log('[mailer debug] EMAIL_PASS present:', !!process.env.EMAIL_PASS);

let transporter = null;
if (!hasEmailCreds) {
  console.warn("⚠️ EMAIL_USER or EMAIL_PASS missing in environment. Mailer will not initialize transporter.");
} else {
  // ✅ Use Gmail service directly
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Optional debug: verify on server start
  transporter.verify((err, success) => {
    if (err) {
      console.error("❌ Mailer verify failed:", err && err.message ? err.message : err);
    } else {
      console.log("✅ Mailer ready to send emails");
    }
  });
}

export const sendOtpMail = async (to, otp) => {
  try {
    if (!hasEmailCreds || !transporter) {
      console.error("Missing EMAIL_USER or EMAIL_PASS env variables or transporter not initialized");
      throw errorHandler(500, "Email configuration error. Please contact support.");
    }

    const from =
      process.env.MAIL_FROM || `Gardenly Support <${process.env.EMAIL_USER}>`;

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
    console.error("Error sending OTP mail:", err.message || err);
    throw errorHandler(
      500,
      "Failed to send OTP email. Please try again later."
    );
  }
};
