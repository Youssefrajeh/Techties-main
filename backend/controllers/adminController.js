const User = require("../models/User");
const Profile = require("../models/Profile");
const MatchFeedback = require("../models/MatchFeedback");
const ContactLog = require("../models/ContactLog");
const UpgradeRequest = require("../models/UpgradeRequest");
const bcrypt = require("bcryptjs");

// helper: Admin-only access check
async function requireAdmin(req, res) {
  const currentUser = await User.findById(req.user);
  if (!currentUser || currentUser.role !== "admin") {
    res.status(403).json({ msg: "Access denied. Admin privileges required." });
    return null;
  }
  return currentUser;
}

// @desc    Get dashboard statistics for Admins
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const currentUser = await requireAdmin(req, res);
    if (!currentUser) return;

    // Requirement: How many free members are registered
    const totalFreeMembers = await User.countDocuments({ isPaid: false, role: { $ne: "admin" } });

    // Requirement: Total number of current paid members
    const totalPaidMembers = await User.countDocuments({ isPaid: true });

    // Requirement: Total number of matches where communication information was exposed
    const totalExposedMatches = await ContactLog.countDocuments();

    // Requirement: Total number of matches (feedbacks) to date
    const totalMatchesToDate = await MatchFeedback.countDocuments();

    res.json({
      metrics: {
        totalFreeMembers,
        totalPaidMembers,
        totalExposedMatches,
        totalMatchesToDate,
      },
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    res.status(500).send("Server error fetching dashboard stats");
  }
};

// @desc    List all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const currentUser = await requireAdmin(req, res);
    if (!currentUser) return;

    const users = await User.find().select("-password").sort({ date: -1 });
    res.json(users);
  } catch (error) {
    console.error("Admin getUsers error:", error);
    res.status(500).send("Server error fetching users");
  }
};

// @desc    Update user role or isPaid (Admin only)
// @route   PATCH /api/admin/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const currentUser = await requireAdmin(req, res);
    if (!currentUser) return;

    const { role, isPaid } = req.body;
    const updates = {};

    if (role !== undefined) {
      const allowedRoles = ["member", "admin"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ msg: "Invalid role value" });
      }
      updates.role = role;
    }

    if (typeof isPaid === "boolean") {
      updates.isPaid = isPaid;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Admin updateUser error:", error);
    res.status(500).send("Server error updating user");
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const currentUser = await requireAdmin(req, res);
    if (!currentUser) return;

    const userId = req.params.id;

    // optional: prevent PM from deleting themselves
    if (String(currentUser._id) === String(userId)) {
      return res.status(400).json({ msg: "You cannot delete your own account from admin." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // delete related profile
    await Profile.deleteOne({ user: userId });

    // delete related feedback
    await MatchFeedback.deleteMany({
      $or: [{ user: userId }, { matchedUser: userId }],
    });

    // delete user
    await User.findByIdAndDelete(userId);

    res.json({ msg: "User deleted successfully" });
  } catch (error) {
    console.error("Admin deleteUser error:", error);
    res.status(500).send("Server error deleting user");
  }
};

// @desc    List all profiles (Admin only)
// @route   GET /api/admin/profiles
// @access  Private (Admin only)
exports.getProfiles = async (req, res) => {
  try {
    const currentUser = await requireAdmin(req, res);
    if (!currentUser) return;

    const profiles = await Profile.find()
      .populate("user", "name email role")
      .sort({ date: -1 });

    res.json(profiles);
  } catch (error) {
    console.error("Admin getProfiles error:", error);
    res.status(500).send("Server error fetching profiles");
  }
};

// @desc    Update profile fields (Admin only)
// @route   PATCH /api/admin/profiles/:id
// @access  Private (Admin only)
exports.updateProfile = async (req, res) => {
  try {
    const currentUser = await requireAdmin(req, res);
    if (!currentUser) return;

    const { allowContactShare } = req.body;
    const updates = {};

    if (typeof allowContactShare === "boolean") {
      updates.allowContactShare = allowContactShare;
    }

    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).populate("user", "name email role");

    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Admin updateProfile error:", error);
    res.status(500).send("Server error updating profile");
  }
};

// @desc    List all match feedback (Admin only)
// @route   GET /api/admin/feedback
// @access  Private (Admin only)
exports.getFeedback = async (req, res) => {
  try {
    const currentUser = await requireAdmin(req, res);
    if (!currentUser) return;

    const feedback = await MatchFeedback.find()
      .populate("user", "name email")
      .populate("matchedUser", "name email")
      .sort({ date: -1 })
      .limit(200);

    res.json(feedback);
  } catch (error) {
    console.error("Admin getFeedback error:", error);
    res.status(500).send("Server error fetching feedback");
  }
};

// @desc    Reset user password (Admin only)
// @route   POST /api/admin/users/:id/reset-password
// @access  Private (Admin only)
exports.resetUserPassword = async (req, res) => {
  try {
    const currentUser = await requireAdmin(req, res);
    if (!currentUser) return;

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ msg: "New password must be at least 8 characters." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Set new password (the User model's pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.json({ msg: "Password reset successfully" });
  } catch (error) {
    console.error("Admin resetPassword error:", error);
    res.status(500).send("Server error resetting password");
  }
};

// @desc    List all upgrade requests (Admin only)
// @route   GET /api/admin/upgrade-requests
// @access  Private (Admin only)
exports.getUpgradeRequests = async (req, res) => {
  try {
    const currentUser = await requireAdmin(req, res);
    if (!currentUser) return;

    const requests = await UpgradeRequest.find()
      .populate("user", "name email isPaid")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Admin getUpgradeRequests error:", error);
    res.status(500).send("Server error fetching upgrade requests");
  }
};

// @desc    Approve or reject upgrade request (Admin only)
// @route   PATCH /api/admin/upgrade-requests/:id
// @access  Private (Admin only)
exports.handleUpgradeRequest = async (req, res) => {
  try {
    const currentUser = await requireAdmin(req, res);
    if (!currentUser) return;

    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const upgradeRequest = await UpgradeRequest.findById(req.params.id);
    if (!upgradeRequest) {
      return res.status(404).json({ msg: "Upgrade request not found" });
    }

    if (upgradeRequest.status !== "pending") {
      return res.status(400).json({ msg: "Request has already been processed." });
    }

    upgradeRequest.status = status;
    await upgradeRequest.save();

    if (status === "approved") {
      await User.findByIdAndUpdate(upgradeRequest.user, { isPaid: true });
    }

    res.json({ msg: `Request ${status} successfully.`, request: upgradeRequest });
  } catch (error) {
    console.error("Admin handleUpgradeRequest error:", error);
    res.status(500).send("Server error handling upgrade request");
  }
};