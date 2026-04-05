const User = require("../models/User");
const UpgradeRequest = require("../models/UpgradeRequest");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, isPaid } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      name,
      email,
      password,
      isPaid: false, // Always start as false, even if requested
    });

    await user.save();

    // If user requested to be paid, create an upgrade request
    if (isPaid === true) {
      const upgradeRequest = new UpgradeRequest({
        user: user._id,
      });
      await upgradeRequest.save();
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isPaid: user.isPaid,
    };

    res.json({ token, user: userPayload });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isPaid: user.isPaid,
    };

    res.json({ token, user: userPayload });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isPaid: user.isPaid,
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

exports.requestUpgrade = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user.isPaid) {
      return res.status(400).json({ msg: "User is already a paid member." });
    }

    // Check for existing pending request
    const existingRequest = await UpgradeRequest.findOne({
      user: req.user,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ msg: "You already have a pending upgrade request." });
    }

    const upgradeRequest = new UpgradeRequest({
      user: req.user,
    });

    await upgradeRequest.save();

    res.json({ msg: "Upgrade request submitted successfully." });
  } catch (err) {
    console.error("RequestUpgrade error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

exports.getUpgradeStatus = async (req, res) => {
  try {
    const request = await UpgradeRequest.findOne({
      user: req.user,
      status: "pending",
    });
    res.json({ status: request ? "pending" : "none" });
  } catch (err) {
    console.error("GetUpgradeStatus error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};