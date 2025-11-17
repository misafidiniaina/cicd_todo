import request from "supertest";
import mongoose from "mongoose";
import { MongoDBContainer } from "@testcontainers/mongodb";

let app;
import User from "../models/User.js";

let container;

beforeAll(async () => {
  // 1️⃣ Start MongoDB container
  container = await new MongoDBContainer("mongo:6.0.1").start();

  // 2️⃣ Override MONGO_URI like in production
  process.env.MONGO_URI = container.getConnectionString();

  // 3️⃣ Dynamically import app AFTER setting env
  // Your app should read process.env.MONGO_URI internally
  app = (await import("../app.js")).default;

  // 4️⃣ Connect mongoose directly using env (simulate production)
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await container.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Auth Integration Tests (Production Simulation)", () => {
  const userData = { username: "realtest", password: "pass123" };

  it("should register a user", async () => {
    const res = await request(app)
      .post("/api/register")
      .send(userData)
      .expect(201);

    expect(res.body.message).toBe("User registered successfully");
  });

//   it("should login a user", async () => {
//     await request(app).post("/api/register").send(userData);

//     const res = await request(app)
//       .post("/api/login")
//       .send(userData)
//       .expect(200);

//     expect(res.body).toHaveProperty("token");
//   });
});
