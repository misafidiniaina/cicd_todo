// config/index.js
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || "default_secret",
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/todo",
};

export const connectDB = async () => {
  // Skip connection in test environment if already connected
  if (process.env.NODE_ENV === "test" && mongoose.connection.readyState !== 0) {
    console.log("✅ MongoDB already connected (test mode)");
    return;
  }

  try {
    await mongoose.connect(config.mongoUri);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    
    // Don't exit in test environment
    if (process.env.NODE_ENV !== "test") {
      console.error("Stack:", err.stack);
      console.error("Mongo URI:", config.mongoUri);
      process.exit(1);
    } else {
      throw err; // In tests, throw instead of exit
    }
  }
};