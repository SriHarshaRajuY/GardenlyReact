// api/scripts/seed.js
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export const seedDefaultUsers = async () => {
  try {
    console.log("\nSeeding default users...\n");

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
      console.log("BUYER CREATED");
    }

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
      console.log("SELLER CREATED");
    }

    console.log("\nDefault user seed complete.\n");
  } catch (err) {
    console.error("Error seeding default users:", err.message);
  }
};
