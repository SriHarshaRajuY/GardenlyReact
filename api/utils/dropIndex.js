// api/utils/dropIndex.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "gardenly" });
    console.log("Connected to MongoDB");

    const Product = mongoose.model("Product", new mongoose.Schema({}));
    await Product.collection.dropIndex("name_text");
    console.log("Dropped index: name_text");

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error dropping index (it might not exist):", err.message);
  }
}

dropIndex();
