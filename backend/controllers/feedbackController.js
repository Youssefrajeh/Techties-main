const MatchFeedback = require("../../backend/models/MatchFeedback");
const User = require("../../backend/models/User");

// @desc    Submit feedback on a match recommendation
// @route   POST /api/feedback/submit
// @access  Private
exports.submitFeedback = async (req, res) => {
  try {
    const { matchedUserId, score, comments } = req.body;

    // Build feedback object
    const newFeedback = new MatchFeedback({
      user: req.user.id,
      matchedUser: matchedUserId,
      score,
      comments
    });

    const feedback = await newFeedback.save();
    res.json(feedback);

  } catch (error) {
    console.error("Error submitting match feedback:", error);
    res.status(500).send("Server error submitting feedback");
  }
};
