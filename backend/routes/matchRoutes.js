const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getMatchRecommendations, getMatchContact } = require("../controllers/matchController");

// @route   GET api/matches/recommendations
// @desc    Get match recommendations based on skills
// @access  Private
router.get("/recommendations", auth, getMatchRecommendations);

// @route   GET api/matches/contact/:matchedUserId
// @desc    Get contact details for a matched user
// @access  Private (Paid Members only)
router.get("/contact/:matchedUserId", auth, getMatchContact);

module.exports = router;
