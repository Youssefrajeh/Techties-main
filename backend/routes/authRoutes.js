const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const { register, login, getMe, requestUpgrade, getUpgradeStatus } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);
router.get("/upgrade-status", auth, getUpgradeStatus);
router.post("/request-upgrade", auth, requestUpgrade);

module.exports = router;