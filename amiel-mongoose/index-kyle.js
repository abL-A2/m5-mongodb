require("dotenv").config();
const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI;
const mongoDB = process.env.DATABASE_NAME;
const URI = `${mongoURI}/${mongoDB}`;

console.log("Connecting to:", URI);

mongoose
  .connect(URI)
  .then(() => console.log(`connect OK`))
  .catch((e) => console.error(`connect error:`, e));

/*

* Schema: defines the structure of data, including any rules for default values and validation; your blueprint for the documents in a collection

? auction item schema:
{
    title: "String of the name of the item",
    description: "String descriptor of item",
    start_price: Number,
    reserve_price: Number > start_price,
  },

* Model: a schema applied to a MongoDB collection; gives you data to actually interact with using CRUD ops

? example auction item, or a 'model instance':
{
  title: "Replica Junkjet",
  description: "A scale model 'junkjet' gun with a functional loading mechanism and a low-powered projectile ejection module.",
  start_price: 2100,
  reserve_price: 3500,
},

* Query: similar to MySQL queries; a structured request sent to MongoDB to perform CRUD ops, similar to MySQL queries but in MongoDB's NoSQL style

? example queries: 

? (find all auction items with a start price > 2000)
db.test_one.find({ start_price: { $gt: 2000}}); <-- $gt = $greater than

? create a new auction item, following the original schema:
db.test_one.create({
  title: "Vintage Fountain Pen",
  description: "A rare 1940s fountain pen, restored to mint condition.",
  start_price: 500,
  reserve_price: 1000,
});

*/
