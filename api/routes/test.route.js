// api/routes/test.route.js
import express from "express";
import { sendOtpMail } from "../utils/mailer.js";

const router = express.Router();

// Test email endpoint
router.post("/send-test-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const testOtp = "123456";
    await sendOtpMail(email, testOtp);

    res.status(200).json({
      success: true,
      message: `Test email sent to ${email}`,
      otp: testOtp,
    });
  } catch (err) {
    console.error("Test email error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send test email: " + err.message,
    });
  }
});

export default router;
