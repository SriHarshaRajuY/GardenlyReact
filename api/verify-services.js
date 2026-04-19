import mongoose from "mongoose";
import { createClient } from "redis";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root or current dir
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;
const REDIS_URL = process.env.REDIS_URL;
const SOLR_URL = process.env.SOLR_URL;

async function testMongo() {
  console.log("🔍 Testing MongoDB...");
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ MongoDB: Connected successfully.");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ MongoDB: Connection failed.", err.message);
  }
}

async function testRedis() {
  console.log("\n🔍 Testing Redis...");
  if (!REDIS_URL) {
    console.log("⚠️ Redis: No REDIS_URL found in .env");
    return;
  }
  const client = createClient({ 
    url: REDIS_URL,
    socket: {
      connectTimeoutMS: 5000
    }
  });
  client.on("error", (err) => {
    // console.error("❌ Redis: Error", err.message);
  });
  
  try {
    await client.connect();
    await client.set("test_key", "connected");
    const val = await client.get("test_key");
    if (val === "connected") {
      console.log("✅ Redis: Connected and Read/Write successful.");
    }
    await client.quit();
  } catch (err) {
    console.error("❌ Redis: Connection failed.", err.message);
  }
}

async function testSolr() {
  console.log("\n🔍 Testing Solr...");
  if (!SOLR_URL) {
    console.log("⚠️ Solr: No SOLR_URL found in .env");
    return;
  }
  try {
    const response = await fetch(`${SOLR_URL}/admin/ping?wt=json`);
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Solr: Connected successfully. Status:", data.status);
    } else {
      console.error("❌ Solr: Connection failed. HTTP Status:", response.status);
    }
  } catch (err) {
    console.error("❌ Solr: Connection failed.", err.message);
  }
}

async function runTests() {
  console.log("========================================");
  console.log("   GARDENLY SERVICE VERIFICATION   ");
  console.log("========================================\n");
  
  await testMongo();
  await testRedis();
  await testSolr();
  
  console.log("\n========================================");
  console.log("             TEST COMPLETE              ");
  console.log("========================================");
  process.exit(0);
}

runTests();
