// api/scripts/seed.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export const seedDefaultUsers = async () => {
  try {
    console.log("\n📦 Seeding default users...\n");

    // ====== DELIVERY MANAGER ======
    const existingManager = await User.findOne({ username: "deliverymanager" });
    if (!existingManager) {
      const hashedPassword = bcrypt.hashSync("Manager@123", 10);
      const deliveryManager = new User({
        username: "deliverymanager",
        email: "manager@gardenly.com",
        password: hashedPassword,
        mobile: "9876543210",
        role: "DeliveryManager",
        expertise: "General",
      });
      await deliveryManager.save();
      console.log("✅ DELIVERY MANAGER CREATED");
    }

    // ====== BUYER ======
    const existingBuyer = await User.findOne({ username: "buyer" });
    if (!existingBuyer) {
      const hashedPassword = bcrypt.hashSync("Buyer@123", 10);
      const buyer = new User({
        username: "buyer",
        email: "maddipatlasaiteja17@gmail.com",
        password: hashedPassword,
        mobile: "9876543213",
        role: "Buyer",
        expertise: "General",
      });
      await buyer.save();
      console.log("✅ BUYER CREATED");
    }

    // ====== SELLER ======
    const existingSeller = await User.findOne({ username: "seller" });
    if (!existingSeller) {
      const hashedPassword = bcrypt.hashSync("Seller@123", 10);
      const seller = new User({
        username: "seller",
        email: "pardhuva.b23@iiits.in",
        password: hashedPassword,
        mobile: "9876543214",
        role: "Seller",
        expertise: "General",
      });
      await seller.save();
      console.log("✅ SELLER CREATED");
    }

    console.log("═══════════════════════════════════════════════\n");
  } catch (err) {
    console.error("❌ Error seeding default users:", err.message);
  }
};
