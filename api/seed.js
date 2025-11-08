import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";

dotenv.config();

const defaultProducts = [
  {
    name: "Money Plant Golden",
    description: "A low-maintenance indoor plant bringing prosperity.",
    price: 199,
    category: "Plants",
    image: "/images/new-products/p6.jpg",
    quantity: 20,
  },
  {
    name: "Rosemary - Plant",
    description: "Fragrant herb for indoor and outdoor gardening.",
    price: 299,
    category: "Plants",
    image: "/images/plantspics/p5.png",
    quantity: 15,
  },
  {
    name: "Spinach Seeds",
    description: "High-quality spinach seeds for your garden.",
    price: 99,
    category: "Seeds",
    image: "/images/seedspic/p5.png",
    quantity: 50,
  },
  {
    name: "Round Plastic Pot Set",
    description: "Durable plastic pots, perfect for small plants.",
    price: 499,
    category: "Pots",
    image: "/images/potspics/p8.png",
    quantity: 25,
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    await Product.deleteMany({});
    await Product.insertMany(defaultProducts);
    console.log("🌿 Default products inserted!");
    mongoose.connection.close();
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
