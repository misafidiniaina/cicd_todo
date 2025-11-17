import request from "supertest";
import mongoose from "mongoose";
import { MongoDBContainer } from "@testcontainers/mongodb";
import User from "../models/User.js";

let app;
let container;

beforeAll(async () => {
  console.log("🐳 Starting MongoDB container...");
  
  // Set test environment FIRST
  process.env.NODE_ENV = "test";
  
  // Disconnect any existing mongoose connection
  if (mongoose.connection.readyState !== 0) {
    console.log("🔌 Disconnecting existing connection...");
    await mongoose.disconnect();
  }

  try {
    console.log("📦 Creating container (mongo:7.0)...");
    container = await new MongoDBContainer("mongo:7.0").start();
    console.log("✅ Container started");
    
    // Get host and port separately to build a proper connection string
    const host = container.getHost();
    const port = container.getMappedPort(27017);
    const mongoUri = `mongodb://${host}:${port}/testdb?directConnection=true`;
    
    console.log("📡 MongoDB URI:", mongoUri);
    
    // Set the MONGO_URI env var
    process.env.MONGO_URI = mongoUri;
    
    console.log("🔗 Connecting mongoose...");
    await mongoose.connect(mongoUri);
    console.log("✅ Mongoose connected");
    
    console.log("📦 Importing app...");
    const appModule = await import("../app.js");
    app = appModule.default;
    console.log("✅ App imported");
    
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    console.error("Full error:", error);
    throw error;
  }
}, 60000); // 3 minutes

afterAll(async () => {
  console.log("🧹 Starting cleanup...");
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      console.log("✅ Database dropped and connection closed");
    }
    if (container) {
      await container.stop();
      console.log("✅ Container stopped");
    }
  } catch (error) {
    console.error("❌ Cleanup error:", error);
  }
}, 30000);

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Auth Integration Tests", () => {
  const userData = { username: "realtest", password: "pass123" };
  
  it("should register a user", async () => {
    const res = await request(app)
      .post("/api/register")
      .send(userData)
      .expect(201);
    
    expect(res.body.message).toBe("User registered successfully");
  });
});