// api/seed.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/user.model.js";

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
      console.log("   Username: deliverymanager");
      console.log("   Email: manager@gardenly.com");
      console.log("   Mobile: 9876543210");
      console.log("   Password: Manager@123\n");
    } else {
      console.log("✓ DELIVERY MANAGER already exists\n");
    }

    // ====== DELIVERY AGENT 1 ======
    const existingAgent1 = await User.findOne({ username: "agent1" });
    if (!existingAgent1) {
      const hashedPassword = bcrypt.hashSync("Agent@123", 10);
      const agent1 = new User({
        username: "agent1",
        email: "agent1@gardenly.com",
        password: hashedPassword,
        mobile: "9876543211",
        role: "DeliveryAgent",
        expertise: "General",
      });
      await agent1.save();
      console.log("✅ DELIVERY AGENT 1 CREATED");
      console.log("   Username: agent1");
      console.log("   Email: agent1@gardenly.com");
      console.log("   Mobile: 9876543211");
      console.log("   Password: Agent@123\n");
    } else {
      console.log("✓ DELIVERY AGENT 1 already exists\n");
    }

    // ====== DELIVERY AGENT 2 ======
    const existingAgent2 = await User.findOne({ username: "agent2" });
    if (!existingAgent2) {
      const hashedPassword = bcrypt.hashSync("Agent@123", 10);
      const agent2 = new User({
        username: "agent2",
        email: "agent2@gardenly.com",
        password: hashedPassword,
        mobile: "9876543212",
        role: "DeliveryAgent",
        expertise: "General",
      });
      await agent2.save();
      console.log("✅ DELIVERY AGENT 2 CREATED");
      console.log("   Username: agent2");
      console.log("   Email: agent2@gardenly.com");
      console.log("   Mobile: 9876543212");
      console.log("   Password: Agent@123\n");
    } else {
      console.log("✓ DELIVERY AGENT 2 already exists\n");
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
      console.log("   Username: buyer");
      console.log("   Email: maddipatlasaiteja17@gmail.com");
      console.log("   Mobile: 9876543213");
      console.log("   Password: Buyer@123\n");
    } else {
      console.log("✓ BUYER already exists\n");
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
      console.log("   Username: seller");
      console.log("   Email: pardhuva.b23@iiits.in");
      console.log("   Mobile: 9876543214");
      console.log("   Password: Seller@123\n");
    } else {
      console.log("✓ SELLER already exists\n");
    }

    console.log("═══════════════════════════════════════════════\n");
  } catch (err) {
    console.error("❌ Error seeding default users:", err.message);
  }
};
