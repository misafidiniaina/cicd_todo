import app from "./app.js";
import { config, connectDB } from "./config/index.js";

const PORT = config.port || 3000;

const startServer = async () => {
  try {
    await connectDB(); // <- make sure Mongoose connects first
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
};

startServer();
