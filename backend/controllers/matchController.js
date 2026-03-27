const Profile = require("../models/Profile");
const User = require("../models/User");
const { computeAge } = require("../utils/dateUtils");

// Helper: compute age from a date-of-birth string

// @desc    Get match recommendations for the current paid member
// @route   GET /api/matches/recommendations
// @access  Private (Paid Members only)
exports.getMatchRecommendations = async (req, res) => {
  try {
    // 1. Verify user is a paid member
    const currentUser = await User.findById(req.user);
    if (!currentUser || !currentUser.isPaid) {
      return res.status(403).json({ msg: "Access denied. Paid membership required for match recommendations." });
    }

    // 2. Get current user's profile to compare against
    const currentProfile = await Profile.findOne({ user: req.user });
    if (!currentProfile) {
      return res.status(400).json({ msg: "Please create a profile first to see matches." });
    }

    // 3. Find all other profiles (don't match with self)
    const otherProfiles = await Profile.find({ user: { $ne: req.user } }).populate("user", ["name"]);

    // 4. Calculate match scores — skip profiles with no valid user
    let recommendations = otherProfiles
      .filter(profile => profile.user != null) // guard against orphaned profiles
      .map((profile) => {
      let score = 0;
      let sharedSkills = [];
      let breakdown = { skills: 0, location: 0, memberType: 0, age: 0 };

      // Compute ages from DOB for accurate matching
      const currentAge = computeAge(currentProfile.dob);
      const targetAge  = computeAge(profile.dob);

      // --- 4.1 Skills Matching (40% Weight) ---
      if (currentProfile.skills && profile.skills && profile.skills.length > 0) {
        let matchCount = 0;
        profile.skills.forEach(skill => {
          const skillLower = skill.toLowerCase().trim();
          if (currentProfile.skills.some(userSkill => userSkill.toLowerCase().trim() === skillLower)) {
            matchCount++;
            sharedSkills.push(skill);
          }
        });
        const skillScore = (matchCount / profile.skills.length) * 40;
        score += skillScore;
        breakdown.skills = Math.round(skillScore);
      }

      // --- 4.2 Location Matching (30% Weight) ---
      if (currentProfile.location && profile.location) {
        if (currentProfile.location.toLowerCase().trim() === profile.location.toLowerCase().trim()) {
          score += 30;
          breakdown.location = 30;
        }
      }

      // --- 4.3 Member Type Alignment (20% Weight) ---
      // Logic: If the other user's memberType is in the current user's preferredMemberTypes
      if (currentProfile.matchingPreferences?.preferredMemberTypes?.length > 0 && profile.memberType) {
        if (currentProfile.matchingPreferences.preferredMemberTypes.includes(profile.memberType)) {
          score += 20;
          breakdown.memberType = 20;
        }
      }

      // --- 4.4 Age Preference (10% Weight) ---
      if (currentProfile.matchingPreferences?.ageRange && targetAge !== null) {
        const { min, max } = currentProfile.matchingPreferences.ageRange;
        if (targetAge >= min && targetAge <= max) {
          score += 10;
          breakdown.age = 10;
        }
      }

      return {
        profileId: profile._id,
        user: profile.user,
        photo: profile.photo,
        bio: profile.bio,
        location: profile.location,
        age: targetAge,          // always computed from DOB
        memberType: profile.memberType,
        skills: profile.skills,
        matchScore: Math.round(score),
        sharedSkills: sharedSkills,
        scoreBreakdown: breakdown,
        allowContactShare: profile.allowContactShare
      };
    });

    // 5. Sort matches, keep scores >= 5 so seeded data is visible
    recommendations = recommendations
      .filter(match => match.matchScore >= 5)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(recommendations);

  } catch (error) {
    console.error("Match generation error:", error);
    res.status(500).send("Server error generating matches");
  }
};

// @desc    Get contact details for a matched user
// @route   GET /api/matches/contact/:matchedUserId
// @access  Private (Paid Members only)
exports.getMatchContact = async (req, res) => {
  try {
    const { matchedUserId } = req.params;

    // 1. Verify current user is paid
    const currentUser = await User.findById(req.user);
    if (!currentUser || !currentUser.isPaid) {
      return res.status(403).json({ msg: "Paid membership required." });
    }

    // 2. Get profiles
    const currentProfile = await Profile.findOne({ user: req.user });
    const targetProfile = await Profile.findOne({ user: matchedUserId }).populate("user", ["email", "name"]);

    if (!currentProfile || !targetProfile) {
      return res.status(404).json({ msg: "Profile not found." });
    }

    // 3. Check target user consent
    if (!targetProfile.allowContactShare) {
      return res.status(403).json({ msg: "This user has not shared their contact information." });
    }

    // 4. Verify user is not fetching their own contact info
    if (String(req.user) === String(matchedUserId)) {
      return res.status(400).json({ msg: "Cannot fetch your own contact info here." });
    }
    
    res.json({
      email: targetProfile.user.email,
      phone: targetProfile.phone || "No phone provided"
    });

  } catch (error) {
    console.error("Contact retrieval error:", error);
    res.status(500).send("Server error");
  }
};
