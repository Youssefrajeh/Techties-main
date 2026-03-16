
const mongoose = require("mongoose");
const dns = require("dns");

// Workaround for local network DNS resolution issues with MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is not defined");
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Remove process.exit(1) for Vercel functions
  }
};

module.exports = connectDB;
