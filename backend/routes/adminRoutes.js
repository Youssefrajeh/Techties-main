const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getProfiles,
  getFeedback,
} = require("../controllers/adminController");

router.get("/dashboard", auth, getDashboardStats);
router.get("/users", auth, getUsers);
router.patch("/users/:id", auth, updateUser);
router.delete("/users/:id", auth, deleteUser);
router.get("/profiles", auth, getProfiles);
router.get("/feedback", auth, getFeedback);

module.exports = router;