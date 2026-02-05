import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/user.model.js";

dotenv.config({ path: "../.env" });

const getAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📊 Connected to MongoDB\n");

    const users = await User.find({}, "username email password role mobile createdAt").lean();
    
    console.log(`✅ Found ${users.length} users:\n`);
    console.table(users);
    
    console.log("\n📋 Detailed List:\n");
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} | Email: ${user.email} | Password: ${user.password} | Role: ${user.role} | Mobile: ${user.mobile}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

getAllUsers();
