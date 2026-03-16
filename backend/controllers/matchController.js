const Profile = require("../models/Profile");
const User = require("../models/User");

// @desc    Get match recommendations for the current paid member
// @route   GET /api/matches/recommendations
// @access  Private (Paid Members only)
exports.getMatchRecommendations = async (req, res) => {
  try {
    // 1. Verify user is a paid member (our temporary 'isPaid' flag logic)
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || !currentUser.isPaid) {
      return res.status(403).json({ msg: "Access denied. Paid membership required for match recommendations." });
    }

    // 2. Get current user's profile to compare against
    const currentProfile = await Profile.findOne({ user: req.user.id });
    if (!currentProfile) {
      return res.status(400).json({ msg: "Please create a profile first to see matches." });
    }

    // 3. Find all other profiles (don't match with self)
    // In a real app, you'd limit this pool based on location or other factors
    const otherProfiles = await Profile.find({ user: { $ne: req.user.id } }).populate("user", ["name", "email"]);

    // 4. Calculate match scores based on overlapping skills
    let recommendations = otherProfiles.map((profile) => {
      let score = 0;
      let sharedSkills = [];

      // Simple matching logic: +1 score for every shared skill
      if (currentProfile.skills && profile.skills) {
        profile.skills.forEach(skill => {
          // Normalize skills to lowercase for better matching
          const skillLower = skill.toLowerCase().trim();
          const userHasSkill = currentProfile.skills.some(userSkill => userSkill.toLowerCase().trim() === skillLower);
          
          if (userHasSkill) {
            score += 1;
            sharedSkills.push(skill);
          }
        });
      }

      return {
        profile: profile,
        matchScore: score,
        sharedSkills: sharedSkills
      };
    });

    // 5. Sort matches by highest score first and filter out anyone with 0 shared skills
    recommendations = recommendations
      .filter(match => match.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(recommendations);

  } catch (error) {
    console.error("Match generation error:", error);
    res.status(500).send("Server error generating matches");
  }
};
