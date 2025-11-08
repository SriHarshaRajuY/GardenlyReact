import mongoose from "mongoose";

const uri = "mongodb+srv://sriharsharajuy23_db_user:CQkubKImBS4zbWYW@gardenly.q6fkbir.mongodb.net/gardenly";

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ Connection error:", err));
