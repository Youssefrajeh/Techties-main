const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const roleGuard = require("../middleware/roleGuard");

const {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getProfiles,
  getFeedback,
} = require("../controllers/adminController");

// All admin routes require authentication AND the "pm" role
router.get("/dashboard", auth, roleGuard("pm"), getDashboardStats);
router.get("/users", auth, roleGuard("pm"), getUsers);
router.patch("/users/:id", auth, roleGuard("pm"), updateUser);
router.delete("/users/:id", auth, roleGuard("pm"), deleteUser);
router.get("/profiles", auth, roleGuard("pm"), getProfiles);
router.get("/feedback", auth, roleGuard("pm"), getFeedback);

module.exports = router;