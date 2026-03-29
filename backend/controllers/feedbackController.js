const MatchFeedback = require("../models/MatchFeedback");

// @desc    Submit feedback on a match recommendation
// @route   POST /api/feedback/submit
// @access  Private
exports.submitFeedback = async (req, res) => {
  try {
    const { matchedUserId, score, comments } = req.body;

    // Validation
    if (!matchedUserId) {
      return res.status(400).json({ msg: "matchedUserId is required." });
    }
    const parsedScore = Number(score);
    if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 5) {
      return res.status(400).json({ msg: "Score must be a number between 1 and 5." });
    }

    // Prevent self-feedback
    if (String(req.user.id || req.user) === String(matchedUserId)) {
      return res.status(400).json({ msg: "You cannot submit feedback for yourself." });
    }

    const feedback = await MatchFeedback.findOneAndUpdate(
      { user: req.user.id || req.user, matchedUser: matchedUserId },
      { score: parsedScore, comments: comments || "", date: Date.now() },
      { upsert: true, new: true }
    );

    res.json({ success: true, feedback });

  } catch (error) {
    console.error("Error submitting match feedback:", error);
    res.status(500).send("Server error submitting feedback");
  }
};
