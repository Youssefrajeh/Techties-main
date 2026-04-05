const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// Assuming .env is in the root
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("MONGO_URI not found in environment variables.");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  role: String
}, { strict: false });

const User = mongoose.model("User", UserSchema);

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("Connected.");

    console.log("Updating users with role 'pm' to 'admin'...");
    const result = await User.updateMany({ role: "pm" }, { $set: { role: "admin" } });
    
    console.log(`Update complete. Matches: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    
    await mongoose.disconnect();
    console.log("Disconnected.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
