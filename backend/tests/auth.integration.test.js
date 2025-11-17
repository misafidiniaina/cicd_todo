import request from "supertest";
import mongoose from "mongoose";
import { MongoDBContainer } from "@testcontainers/mongodb";
import User from "../models/User.js";

let app;
let container;

beforeAll(async () => {
  // Disconnect any existing mongoose connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Start MongoDB container
  container = await new MongoDBContainer("mongo:8.0").start();
  
  // Set env variables
  process.env.MONGO_URI = container.getConnectionString();
  process.env.NODE_ENV = "test";
  
  // Connect to test database
  await mongoose.connect(process.env.MONGO_URI);
  
  // Import app AFTER connection
  const appModule = await import("../app.js");
  app = appModule.default;
}, 60000);

afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (container) {
      await container.stop();
    }
  } catch (error) {
    console.error("Cleanup error:", error);
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