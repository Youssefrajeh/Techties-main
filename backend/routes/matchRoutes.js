const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getMatchRecommendations, getMatchContact, getReceivedInterest } = require("../controllers/matchController");

// @route   GET api/matches/recommendations
// @desc    Get match recommendations based on skills
// @access  Private
router.get("/recommendations", auth, getMatchRecommendations);

// @route   GET api/matches/received-interest
// @desc    Get users who displayed interest in the current user
// @access  Private
router.get("/received-interest", auth, getReceivedInterest);

module.exports = router;
