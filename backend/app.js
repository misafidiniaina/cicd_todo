import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// ✅ Enable CORS
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true, // allow cookies or Authorization headers if needed
  })
);

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use("/api", authRoutes);

export default app;
