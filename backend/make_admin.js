const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("MONGO_URI not found.");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  role: String,
  email: String
}, { strict: false });

const User = mongoose.model("User", UserSchema);

async function makeAdmin() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB.");

    const result = await User.updateMany({ email: "admin@techties.com" }, { $set: { role: "admin" } });
    console.log(`Updated ${result.modifiedCount} user(s) to admin.`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Failed:", err);
    process.exit(1);
  }
}

makeAdmin();
