const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getMatchRecommendations } = require("../controllers/matchController");

// @route   GET api/matches/recommendations
// @desc    Get match recommendations based on skills
// @access  Private
router.get("/recommendations", auth, getMatchRecommendations);

module.exports = router;
