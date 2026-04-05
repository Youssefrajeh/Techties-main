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
  updateProfile,
  getFeedback,
  resetUserPassword,
  getUpgradeRequests,
  handleUpgradeRequest,
} = require("../controllers/adminController");

// All admin routes require authentication AND the "admin" role
router.get("/dashboard", auth, roleGuard("admin"), getDashboardStats);
router.get("/users", auth, roleGuard("admin"), getUsers);
router.patch("/users/:id", auth, roleGuard("admin"), updateUser);
router.delete("/users/:id", auth, roleGuard("admin"), deleteUser);
router.get("/profiles", auth, roleGuard("admin"), getProfiles);
router.patch("/profiles/:id", auth, roleGuard("admin"), updateProfile);
router.get("/feedback", auth, roleGuard("admin"), getFeedback);
router.get("/upgrade-requests", auth, roleGuard("admin"), getUpgradeRequests);
router.patch("/upgrade-requests/:id", auth, roleGuard("admin"), handleUpgradeRequest);

// @route   POST api/admin/users/:id/reset-password
// @desc    Reset user password (Admin only)
// @access  Private (Admin only)
router.post("/users/:id/reset-password", auth, roleGuard("admin"), resetUserPassword);

module.exports = router;