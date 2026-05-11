import mongoose from "mongoose";
import dotenv from "dotenv";
import Community from "../models/community.model.js";
import User from "../models/user.model.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const seedCommunities = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "gardenly" });
    console.log("Connected to MongoDB for seeding");

    let worldComm = await Community.findOne({ name: "World Community" });
    if (!worldComm) {
      worldComm = new Community({
        name: "World Community",
        description: "The global gathering for all Gardenly members! Share tips, photos, and insights with everyone.",
        category: "General",
        image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      });
      await worldComm.save();
      console.log("Created World Community");
    }

    const themes = [
      {
        name: "Monstera Lovers",
        description: "Everything about Monsteras! Care, propagation, and photos.",
        category: "Plants",
        image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      },
      {
        name: "Seed Starters",
        description: "Tips and tricks for starting your garden from seeds.",
        category: "Seeds",
        image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      },
      {
        name: "Organic Gardening",
        description: "Focus on pesticide-free and natural gardening methods.",
        category: "Tips",
        image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      }
    ];

    for (const theme of themes) {
      const exists = await Community.findOne({ name: theme.name });
      if (!exists) {
        await new Community(theme).save();
        console.log(`Created ${theme.name}`);
      }
    }

    console.log("Syncing existing users to World Community...");
    const users = await User.find({});
    for (const user of users) {
      await Community.findByIdAndUpdate(worldComm._id, { $addToSet: { members: user._id } });
      await User.findByIdAndUpdate(user._id, { $addToSet: { joinedCommunities: worldComm._id } });
    }

    console.log("Seeding complete!");
    process.exit();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedCommunities();
