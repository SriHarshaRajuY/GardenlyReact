// api/utils/checkIndexes.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function checkIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "gardenly" });
    console.log("Connected to MongoDB");

    const Product = mongoose.model("Product", new mongoose.Schema({}));
    const indexes = await Product.collection.listIndexes().toArray();
    console.log("Product Indexes:");
    console.log(JSON.stringify(indexes, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkIndexes();
