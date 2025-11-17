import request from "supertest";
import mongoose from "mongoose";
import { MongoDBContainer } from "@testcontainers/mongodb";
let app;
import User from "../models/User.js";
let container;

beforeAll(async () => {
  // Start MongoDB container
  container = await new MongoDBContainer("mongo:8.0").start();
  // Override env like production
  process.env.MONGO_URI = container.getConnectionString();
  // Import app AFTER setting env
  app = (await import("../app.js")).default;
  // Connect Mongoose (ignore your connectDB function)
  await mongoose.connect(process.env.MONGO_URI);
}, 60000); // 60 second timeout for container startup

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await container.stop();
}, 30000); // 30 second timeout for cleanup

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