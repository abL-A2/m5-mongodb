// config
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
app.use(express.json());

const mongoURI = process.env.MONGO_URI;
const mongoDB = process.env.DATABASE_NAME;
const PORT = process.env.PORT || 3000;
const URI = `${mongoURI}/${mongoDB}`;

// ! ⚠️ for testing:
if (process.env.NODE_ENV !== "test") {
  // comment this line out if not testing
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
} // comment this line out if not testing

// connecting to mongod
mongoose
  .connect(URI)
  .then(() =>
    console.log(`
    Connected OK to: ${URI}\n
    > Available Routes:\n
       /api/collections                     - List all available collections
       /api/collection/:collectionName      - Query a specific collection\n
    > Query Parameters (add to collection routes):\n
       - title=String: Filter by item title (case-insensitive partial match)
       - min_price=Number: Filter by minimum start price (start_price >= value)
       - max_price=Number: Filter by maximum start price (start_price <= value)
       - min_reserve=Number: Filter by minimum reserve price (reserve_price >= value)
       - max_reserve=Number: Filter by maximum reserve price (reserve_price <= value)\n
    > Examples:\n
       /api/collection/test_one             - Get all items in test_one collection
       /api/collection/test_two?title=chair - Search for 'chair' in test_two collection
       /api/collection/items?min_price=50   - Items $50 or more in items collection\n
    > Combine parameters with '&' for advanced filtering
  `)
  )
  .catch((e) => console.error("Connect error:", e));

// establishing the schema's document/field format
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  start_price: { type: Number, required: true },
  reserve_price: { type: Number, required: true },
}, { strict: false }); // ! allows extra fields, careful

// models for different collections
const models = new Map();

// function to get models 
const getModel = (collectionName) => {
  if (!models.has(collectionName)) {
    models.set(collectionName, mongoose.model(collectionName, itemSchema, collectionName));
  }
  return models.get(collectionName);
};

// routes 
app.get("/api/collections", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json(collections.map(c => c.name));
  } catch (e) {
    console.error("Error fetching collections:", e);
    res.status(500).send("Internal server error");
  }
});

// colllection routing by name
app.get("/api/collection/:collectionName", async (req, res) => {
  try {
    const { collectionName } = req.params;
    const { title, min_price, max_price, min_reserve, max_reserve } = req.query;

    const query = {};

    if (title) query.title = new RegExp(title, "i");
    if (min_price) query.start_price = { $gte: parseFloat(min_price) };
    if (max_price) query.start_price = { ...query.start_price, $lte: parseFloat(max_price) };
    if (min_reserve) query.reserve_price = { $gte: parseFloat(min_reserve) };
    if (max_reserve) query.reserve_price = { ...query.reserve_price, $lte: parseFloat(max_reserve) };

    const Model = getModel(collectionName);
    const items = await Model.find(query);
    res.json(items);
  } catch (e) {
    console.error("Error fetching items:", e);
    res.status(500).send("Internal server error");
  }
});

// ! ⚠️ exclusively for testing
module.exports = app;
