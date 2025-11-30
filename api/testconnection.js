import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // 

const uri = process.env.MONGO_URI; // 

if (!uri) {
  console.error("❌ MONGO_URI is missing. Check your .env file.");
  process.exit(1);
}

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ Connection error:", err));
