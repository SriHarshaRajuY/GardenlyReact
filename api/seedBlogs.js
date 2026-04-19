import mongoose from "mongoose";
import dotenv from "dotenv";
import Blog from "./models/blog.model.js";

dotenv.config();

const blogs = [
  {
    title: "How to Grow Your Own Organic Vegetables",
    slug: "how-to-grow-organic-vegetables",
    excerpt: "Eating fresh from your garden is a dream for many. Here's how to start your organic journey.",
    content: "Organic gardening is more than just avoiding chemicals; it's about nurturing the soil and creating a balanced ecosystem. Start with high-quality compost and choose heirloom seeds for the best flavor...",
    image: "/images/blogs/all1.webp",
    category: "Organic",
    date: "2025-04-10"
  },
  {
    title: "10 Best Low-Light Plants for Your Apartment",
    slug: "best-low-light-plants-apartment",
    excerpt: "No windows? No problem! These plants thrive even in the dimmest corners of your home.",
    content: "Snake plants and Pothos are classic choices for low-light environments. They are incredibly resilient and can handle occasional neglect, making them perfect for busy urban dwellers...",
    image: "/images/blogs/all2.webp",
    category: "Indoor",
    date: "2025-04-12"
  },
  {
    title: "Sustainable Watering Techniques for Summer",
    slug: "sustainable-watering-summer",
    excerpt: "Conserve water while keeping your garden lush during the hottest months of the year.",
    content: "Drip irrigation and mulching are key to water conservation. Watering early in the morning or late in the evening reduces evaporation and ensures your plants get the hydration they need...",
    image: "/images/blogs/f1.webp",
    category: "Sustainability",
    date: "2025-04-15"
  },
  {
    title: "The Art of Bonsai: A Beginner's Journey",
    slug: "art-of-bonsai-beginners",
    excerpt: "Bonsai is more than just miniature trees; it's a meditative practice of patience and care.",
    content: "Starting a bonsai requires understanding the specific needs of your tree species. Pruning, wiring, and repotting are essential skills you will develop as you grow in this art form...",
    image: "/images/blogs/article1.webp",
    category: "Art",
    date: "2025-04-18"
  },
  {
    title: "Hydroponics: Gardening Without Soil",
    slug: "hydroponics-gardening-without-soil",
    excerpt: "Discover the future of urban farming with soil-less cultivation methods.",
    content: "Hydroponics allows for faster growth rates and higher yields by delivering nutrients directly to the roots. It's an efficient way to grow greens in small indoor spaces...",
    image: "/images/blogs/article2.jpg",
    category: "Tech",
    date: "2025-04-20"
  },
  {
    title: "Attracting Pollinators to Your Backyard",
    slug: "attracting-pollinators-backyard",
    excerpt: "Bees, butterflies, and birds are essential for a healthy garden. Learn how to welcome them.",
    content: "Planting a variety of native flowers that bloom at different times of the year will provide a steady food source for pollinators. Avoid pesticides to keep your garden safe for these tiny helpers...",
    image: "/images/blogs/image1.webp",
    category: "Eco",
    date: "2025-04-22"
  }
];

const seedBlogs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");
    
    await Blog.deleteMany({});
    await Blog.insertMany(blogs);
    
    console.log("Database seeded with dynamic blogs successfully!");
    process.exit();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedBlogs();
