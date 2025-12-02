import { sendOtpMail } from "../utils/mailer.js";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export const sendTestEmail = async (req, res, next) => {
  const to = req.query.to || process.env.EMAIL_USER;
  if (!to) return res.status(400).json({ success: false, message: "No recipient provided and EMAIL_USER not set." });

  try {
    await sendOtpMail(to, "123456");
    res.json({ success: true, message: `Test email sent to ${to}` });
  } catch (err) {
    // err may be an Error or an object from errorHandler; return message for debugging
    const msg = err?.message || String(err);
    res.status(500).json({ success: false, message: "Test email failed", error: msg });
  }
};

// Dev-only: create sample manager and agent users if they don't exist.
export const seedUsers = async (req, res, next) => {
  try {
    const managerData = {
      username: "manager1",
      email: "manager1@example.com",
      password: "Manager1!",
      role: "Manager",
      mobile: "9000000001",
    };
    const agentData = {
      username: "agent1",
      email: "agent1@example.com",
      password: "Agent1!",
      role: "Agent",
      mobile: "9000000002",
      isAvailable: true,
    };

    const created = {};

    // manager
    let m = await User.findOne({ $or: [{ username: managerData.username }, { email: managerData.email }] });
    if (!m) {
      const hashed = bcrypt.hashSync(managerData.password, 10);
      m = new User({ ...managerData, password: hashed });
      await m.save();
      created.manager = { username: m.username, email: m.email, password: managerData.password };
    } else {
      created.manager = { username: m.username, email: m.email, note: "already exists" };
    }

    // agent
    let a = await User.findOne({ $or: [{ username: agentData.username }, { email: agentData.email }] });
    if (!a) {
      const hashed = bcrypt.hashSync(agentData.password, 10);
      a = new User({ ...agentData, password: hashed });
      await a.save();
      created.agent = { username: a.username, email: a.email, password: agentData.password };
    } else {
      created.agent = { username: a.username, email: a.email, note: "already exists" };
    }

    res.json({ success: true, created });
  } catch (err) {
    next(err);
  }
};
