const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { submitFeedback } = require("../controllers/feedbackController");

// @route   POST api/feedback/submit
// @desc    Submit feedback/rating for a match recommendation
// @access  Private
router.post("/submit", auth, submitFeedback);

module.exports = router;
