const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

const { register, login, getMe, requestUpgrade, getUpgradeStatus } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);
router.get("/upgrade-status", auth, getUpgradeStatus);
router.post("/request-upgrade", auth, requestUpgrade);

// Temporary workaround route to set admin from production environment
router.get("/make-admin", async (req, res) => {
  try {
    const result = await User.updateOne({ email: "admin@techties.com" }, { role: "admin" });
    res.send(`Updated admin@techties.com to admin role. Matches: ${result.matchedCount}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;