import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// Load env vars from root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

import Product from "../models/product.model.js";
import Blog from "../models/blog.model.js";
import Community from "../models/community.model.js";

const imageDirs = [
  path.join(__dirname, "../public/images"),
  path.join(__dirname, "../uploads"),
];

function findImageLocally(imageName) {
  const baseName = path.basename(imageName.replace(/\\/g, '/'));
  for (const dir of imageDirs) {
    if (fs.existsSync(dir)) {
      // It might be directly in this dir, or in a sub-folder. Let's recursively search or just check known sub-folders.
      const searchRecursively = (currentDir) => {
        const files = fs.readdirSync(currentDir);
        for (const file of files) {
          const fullPath = path.join(currentDir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            const found = searchRecursively(fullPath);
            if (found) return found;
          } else if (file === baseName) {
            return fullPath;
          }
        }
        return null;
      };
      
      const foundPath = searchRecursively(dir);
      if (foundPath) return foundPath;
    }
  }
  return null;
}

async function migrateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to MongoDB");

    const models = [
      { name: "Product", model: Product },
      { name: "Blog", model: Blog },
      { name: "Community", model: Community },
    ];

    for (const { name, model } of models) {
      console.log(`\n📦 Checking ${name}s...`);
      const documents = await model.find({});
      let updatedCount = 0;

      for (const doc of documents) {
        if (doc.image && !doc.image.startsWith("http")) {
          console.log(`[${name}] ${doc._id} has local image: ${doc.image}`);
          
          const localPath = findImageLocally(doc.image);
          if (!localPath) {
            console.log(`  ❌ Could not find local file for ${doc.image}`);
            continue;
          }

          console.log(`  ⏳ Uploading ${localPath} to Cloudinary...`);
          try {
            const result = await cloudinary.uploader.upload(localPath, {
              folder: "gardenly/images",
              allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
              transformation: [{ width: 1000, crop: "limit" }],
            });

            doc.image = result.secure_url;
            await doc.save();
            console.log(`  ✅ Successfully updated to ${result.secure_url}`);
            updatedCount++;
          } catch (uploadError) {
            console.error(`  ❌ Failed to upload ${doc.image}:`, uploadError.message);
          }
        }
      }
      console.log(`✅ Finished checking ${name}s. Updated ${updatedCount} documents.`);
    }

    console.log("\n🎉 Migration complete!");
  } catch (err) {
    console.error("❌ Migration error:", err);
  } finally {
    mongoose.connection.close();
  }
}

migrateImages();
