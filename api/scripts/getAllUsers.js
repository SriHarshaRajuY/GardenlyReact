import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const getAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📊 Connected to MongoDB\n");

    const users = await User.find({}, "username email password role mobile createdAt").lean();
    
    console.log(`✅ Found ${users.length} users:\n`);
    console.table(users);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

getAllUsers();
