// config
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("./mongoose-api");
require("dotenv").config();

const request = supertest(app);

let server;
beforeAll(async () => {
  const TEST_DB_URI = `${process.env.MONGO_URI}/${process.env.DATABASE_NAME}`;
  await mongoose.connect(TEST_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  server = app.listen(); // start the app without specifying a port
});

afterAll(async () => {
  await mongoose.disconnect();
  server.close(); // Close the server after tests
});

// * 1. hi can you even connect

describe("Basic Connection Tests", () => {
  it("1. should connect to the database", async () => {
    // wait until connection is ready
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      await new Promise((resolve) => {
        mongoose.connection.once("connected", resolve);
      });
    }
    // only assert after ensuring connection
    expect(mongoose.connection.readyState).toBe(1);
  });

  it("2. should respond to the base API endpoint", async () => {
    const response = await request.get("/api/items");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true); // Ensure response is an array
  });
});

// * 2. title searches & min price/reserve searches

describe("Title & Min_Price/Reserve Searches", () => {
  it("1. should return items matching a title (case-insensitive)", async () => {
    const response = await request.get("/api/items?title=microscope");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe("Antique Microscope");
  });

  it("2. should filter items by minimum start price", async () => {
    const response = await request.get("/api/items?min_price=100");
    expect(response.status).toBe(200);
    expect(response.body.every((item) => item.start_price >= 100)).toBe(true);
  });

  it("3. should filter items by minimum reserve price", async () => {
    const response = await request.get("/api/items?min_reserve=300");
    expect(response.status).toBe(200);
    expect(response.body.every((item) => item.reserve_price >= 300)).toBe(true);
  });
});

// * 3. max_ & combination min/max_ (range) searches

describe("Max-Only & Min/Max Range Searches", () => {
  it("1. should filter items by maximum start price", async () => {
    const response = await request.get("/api/items?max_price=500");
    expect(response.status).toBe(200);
    expect(response.body.every((item) => item.start_price <= 500)).toBe(true);
  });

  it("2. should filter items by maximum reserve price", async () => {
    const response = await request.get("/api/items?max_reserve=800");
    expect(response.status).toBe(200);
    expect(response.body.every((item) => item.reserve_price <= 800)).toBe(true);
  });

  it("3. should filter items by start price range (min & max)", async () => {
    const response = await request.get("/api/items?min_price=100&max_price=500");
    expect(response.status).toBe(200);
    expect(response.body.every((item) => item.start_price >= 100 && item.start_price <= 500)).toBe(true);
  });

  it("4. should filter items by reserve price range (min & max)", async () => {
    const response = await request.get("/api/items?min_reserve=300&max_reserve=800");
    expect(response.status).toBe(200);
    expect(response.body.every((item) => item.reserve_price >= 300 && item.reserve_price <= 800)).toBe(true);
  });
});
