import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../models/User.js"; // adjust path

let mongoServer;

beforeAll(async () => {
  // Start the in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Clean and close after all tests
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Auth Tests", () => {
  const userData = {
    username: "testuser",
    password: "password123",
  };

  beforeEach(async () => {
    // Reset the database before each test
    await User.deleteMany({});
  });

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/register")
      .send(userData)
      .expect(201);

    expect(res.body).toHaveProperty("message", "User registered successfully");
    expect(res.body).toHaveProperty("userId");
  });

  it("should not register user with missing fields", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({ username: "missingpass" })
      .expect(400);

    expect(res.body.message).toBe("Username and password are required");
  });

  it("should login with correct credentials", async () => {
    // Register user first
    await request(app).post("/api/register").send(userData);

    const res = await request(app)
      .post("/api/login")
      .send(userData)
      .expect(200);

    expect(res.body).toHaveProperty("token");
  });

  it("should reject login with wrong password", async () => {
    await request(app).post("/api/register").send(userData);

    const res = await request(app)
      .post("/api/login")
      .send({ username: "testuser", password: "wrongpass" })
      .expect(400);

    expect(res.body.message).toBe("Invalid password");
  });
});
