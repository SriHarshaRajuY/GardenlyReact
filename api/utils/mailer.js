// api/utils/mailer.js
import nodemailer from "nodemailer";
import { errorHandler } from "./error.js";

let transporter;

const getEmailConfig = () => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();
  const from = process.env.MAIL_FROM || `Gardenly Support <${emailUser}>`;

  return { emailUser, emailPass, from };
};

const assertEmailConfigured = () => {
  const config = getEmailConfig();

  if (!config.emailUser || !config.emailPass) {
    throw errorHandler(
      500,
      "Email configuration error. Please contact support."
    );
  }

  return config;
};

const getTransporter = () => {
  const { emailUser, emailPass } = assertEmailConfigured();

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  return transporter;
};

export const verifyMailer = async () => {
  await getTransporter().verify();
  return true;
};

/**
 * Send OTP email
 * @param {string} to - receiver email
 * @param {string|number} otp - otp code
 */
export const sendOtpMail = async (to, otp) => {
  try {
    const { from } = assertEmailConfigured();

    const info = await getTransporter().sendMail({
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

    console.log("OTP email sent:", info.messageId);
    return true;
  } catch (err) {
    if (err.statusCode) throw err;
    console.error("Error sending OTP mail:", err);
    throw errorHandler(
      500,
      "Failed to send OTP email. Please try again later."
    );
  }
};

export const sendSignupVerificationMail = async (to, otp) => {
  try {
    const { from } = assertEmailConfigured();

    await getTransporter().sendMail({
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
    if (err.statusCode) throw err;
    console.error(err);
    throw errorHandler(500, "Failed to send verification email");
  }
};

export const send2FAMail = async (to, otp) => {
  try {
    const { from } = assertEmailConfigured();

    await getTransporter().sendMail({
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
    if (err.statusCode) throw err;
    console.error(err);
    throw errorHandler(500, "Failed to send 2FA email");
  }
};

export const sendMail = async (to, subject, text) => {
  try {
    const { from } = assertEmailConfigured();

    await getTransporter().sendMail({
      from,
      to,
      subject,
      text,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.5; white-space: pre-wrap;">${text}</div>`,
    });
    return true;
  } catch (err) {
    if (err.statusCode) throw err;
    console.error("Error sending mail:", err);
    throw errorHandler(500, "Failed to send email.");
  }
};
