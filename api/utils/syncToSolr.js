// api/utils/syncToSolr.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/product.model.js";
import { connectSolr, indexProduct, getSolrClient } from "./solr.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function sync() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "gardenly" });
    console.log("Connected to MongoDB");

    connectSolr();

    const products = await Product.find({});
    console.log(`Found ${products.length} products to sync...`);

    for (const product of products) {
      await indexProduct(product);
      console.log(`Indexed: ${product.name}`);
    }

    console.log("Sync complete!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Sync failed:", err);
    process.exit(1);
  }
}

sync();
