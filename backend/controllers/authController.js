// controllers/authController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // MongoDB user model
import { comparePassword, hashPassword } from "../utils/hash.js"; // use your existing hash utils
import { config } from "../config/index.js";

// Login controller
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username) return res.status(400).json({ message: "Empty username" });
    if (!password) return res.status(400).json({ message: "Empty password" });

    // Find user in MongoDB
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Compare passwords
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Invalid password" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, config.jwtSecret, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password)
      return res.status(400).json({ message: "Username and password are required" });

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "Username already taken" });

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id, username: user.username }, config.jwtSecret, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
