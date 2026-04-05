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
  resetUserPassword,
  getUpgradeRequests,
  handleUpgradeRequest,
} = require("../controllers/adminController");

// All admin routes require authentication AND the "pm" role
router.get("/dashboard", auth, roleGuard("pm"), getDashboardStats);
router.get("/users", auth, roleGuard("pm"), getUsers);
router.patch("/users/:id", auth, roleGuard("pm"), updateUser);
router.delete("/users/:id", auth, roleGuard("pm"), deleteUser);
router.get("/profiles", auth, roleGuard("pm"), getProfiles);
router.get("/feedback", auth, roleGuard("pm"), getFeedback);
router.get("/upgrade-requests", auth, roleGuard("pm"), getUpgradeRequests);
router.patch("/upgrade-requests/:id", auth, roleGuard("pm"), handleUpgradeRequest);

// @route   POST api/admin/users/:id/reset-password
// @desc    Reset user password (PM only)
// @access  Private (PM only)
router.post("/users/:id/reset-password", auth, roleGuard("pm"), resetUserPassword);

module.exports = router;