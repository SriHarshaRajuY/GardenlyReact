require('dotenv').config();
const mongoose = require('mongoose');

// === CONNECT TO MONGODB ATLAS ===
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('MONGO_URI is missing in .env file');
  process.exit(1);
}

mongoose
  .connect(mongoURI, {
    serverSelectionTimeoutMS: 30000,
    bufferCommands: false,
  })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// === SCHEMAS ===
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  expertise: { type: String },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, default: 'General' },
  image: { type: String },
  seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  quantity: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  sold_at: { type: Date },
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

// === DEFAULT USERS ===
const defaultUsers = [
  { username: 'admin', password: 'admin123', role: 'Admin', email: 'admin@example.com', mobile: '1234567890' },
  { username: 'seller1', password: 'seller123', role: 'Seller', email: 'seller1@example.com', mobile: '2345678901' },
  { username: 'buyer1', password: 'buyer123', role: 'Buyer', email: 'buyer1@example.com', mobile: '3456789012' },
];

// === DEFAULT PRODUCTS (38+ with correct /images/... paths) ===
const defaultProducts = [
  // PLANTS
  { name: 'Peace Lily, Spathiphyllum - Plant', description: 'Elegant indoor plant with white blooms.', price: 165, category: 'Plants', image: '/images/plantspics/p1.png', quantity: 20, sold: 5 },
  { name: 'Parijat Tree, Parijatak - Plant', description: 'Fragrant night-blooming tree.', price: 259, category: 'Plants', image: '/images/plantspics/p2.png', quantity: 15, sold: 3 },
  { name: 'Raat Ki Rani - Plant', description: 'Intensely fragrant night bloomer.', price: 499, category: 'Plants', image: '/images/plantspics/p3.png', quantity: 10, sold: 2 },
  { name: 'Damascus Rose - Plant', description: 'Scented rose for oils and beauty.', price: 475, category: 'Plants', image: '/images/plantspics/p4.png', quantity: 0, sold: 4 },
  { name: 'Rosemary - Plant', description: 'Aromatic herb for cooking.', price: 299, category: 'Plants', image: '/images/plantspics/p5.png', quantity: 12, sold: 1 },
  { name: 'Rhoeo Tricolor - Plant', description: 'Colorful foliage plant.', price: 999, category: 'Plants', image: '/images/plantspics/p6.png', quantity: 8, sold: 0 },
  { name: 'Madhumalti Dwarf - Plant', description: 'Color-changing flowering vine.', price: 475, category: 'Plants', image: '/images/plantspics/p7.png', quantity: 15, sold: 2 },
  { name: 'Lemon Grass - Plant', description: 'Citrus-scented culinary herb.', price: 475, category: 'Plants', image: '/images/plantspics/p8.png', quantity: 20, sold: 3 },
  { name: 'Snake Plant (Sansevieria)', description: 'Air-purifying, low-light tolerant.', price: 399, category: 'Plants', image: '/images/plantspics/snake-plant.jpg', quantity: 25, sold: 8 },
  { name: 'Aloe Vera - Plant', description: 'Medicinal plant for skin and health.', price: 249, category: 'Plants', image: '/images/plantspics/aloe-vera.jpg', quantity: 30, sold: 12 },
  { name: 'Jade Plant (Money Tree)', description: 'Symbol of prosperity and luck.', price: 599, category: 'Plants', image: '/images/plantspics/jade-plant.jpg', quantity: 18, sold: 5 },
  { name: 'ZZ Plant (Zamioculcas)', description: 'Nearly indestructible indoor plant.', price: 799, category: 'Plants', image: '/images/plantspics/zz-plant.jpg', quantity: 15, sold: 3 },
  { name: 'Money Plant Golden', description: 'Brings prosperity and clean air.', price: 199, category: 'Plants', image: '/images/new-products/p6.jpg', quantity: 20, sold: 15 },
  { name: 'Parijat Tree (Small)', description: 'Mini version for balcony.', price: 399, category: 'Plants', image: '/images/new-products/p4.jpg', quantity: 10, sold: 5 },

  // SEEDS
  { name: 'Spinach Seeds', description: 'Fast-growing leafy green.', price: 99, category: 'Seeds', image: '/images/new-products/p5.jpg', quantity: 50, sold: 30 },
  { name: 'Marigold Flower Seeds', description: 'Bright and cheerful flowers.', price: 680, category: 'Seeds', image: '/images/seedspic/p1.jpg', quantity: 50, sold: 0 },
  { name: 'Tomato Seeds (Hybrid)', description: 'High-yield, disease-resistant.', price: 350, category: 'Seeds', image: '/images/seedspic/p2.png', quantity: 50, sold: 0 },
  { name: 'Basil Herb Seeds', description: 'Aromatic Italian herb.', price: 90, category: 'Seeds', image: '/images/seedspic/p3.png', quantity: 50, sold: 0 },
  { name: 'Sunflower Seeds', description: 'Giant blooms for garden beauty.', price: 150, category: 'Seeds', image: '/images/seedspic/p5.png', quantity: 0, sold: 0 },
  { name: 'Chilli Seeds (Bird’s Eye)', description: 'Spicy Thai variety.', price: 120, category: 'Seeds', image: '/images/seedspic/chilli.jpg', quantity: 40, sold: 10 },
  { name: 'Coriander Seeds', description: 'Fresh cilantro leaves.', price: 80, category: 'Seeds', image: '/images/seedspic/coriander.jpg', quantity: 60, sold: 15 },

  // POTS
  { name: 'Round Plastic Pot Set', description: 'Durable, colorful pots.', price: 499, category: 'Pots', image: '/images/new-products/p7.jpg', quantity: 15, sold: 12 },
  { name: '5.1 inch Round Thermoform Pot', description: 'Mix color, lightweight.', price: 365, category: 'Pots', image: '/images/potspics/p1.png', quantity: 20, sold: 0 },
  { name: 'Ceramic Tulsi Vrindavan', description: 'Traditional holy basil pot.', price: 499, category: 'Pots', image: '/images/potspics/p3.png', quantity: 10, sold: 0 },
  { name: 'Hanging Macrame Pot', description: 'Bohemian style hanging planter.', price: 599, category: 'Pots', image: '/images/potspics/hanging.jpg', quantity: 25, sold: 7 },
  { name: 'Self-Watering Pot (10 inch)', description: 'Smart watering system.', price: 899, category: 'Pots', image: '/images/potspics/self-water.jpg', quantity: 12, sold: 3 },

  // ACCESSORIES
  { name: 'Organic Compost (5kg)', description: 'Natural fertilizer for plants.', price: 299, category: 'Accessories', image: '/images/accessories/compost.jpg', quantity: 30, sold: 8 },
  { name: 'Garden Tool Set (3 pcs)', description: 'Trowel, pruner, weeder.', price: 799, category: 'Accessories', image: '/images/accessories/tools.jpg', quantity: 20, sold: 5 },
];

// === SEED DATABASE ===
async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    await mongoose.connection.asPromise();

    // Clear collections
    await Promise.all([User.deleteMany({}), Product.deleteMany({})]);
    console.log('Cleared users and products');

    // Insert users
    const users = await User.insertMany(defaultUsers);
    const seller = users.find((u) => u.username === 'seller1');
    if (!seller) throw new Error('Seller not found');

    // Assign seller + random sold_at
    const productsWithSeller = defaultProducts.map((p) => ({
      ...p,
      seller_id: seller._id,
      sold_at: p.sold > 0 ? new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000) : null,
    }));

    // Insert products
    const inserted = await Product.insertMany(productsWithSeller);
    console.log(`Seeded ${inserted.length} products`);
    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

// === RUN ONCE ===
initializeDatabase();