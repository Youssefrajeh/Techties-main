const express = require("express");
const Profile = require("../models/Profile");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user });

    if (profile) {
      res.json(profile);
    } else {
      res.status(404).json({ message: "Profile not found", isNewUser: true });
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth, async (req, res) => {
  const profileFields = {
    user: req.user,
    salutation: req.body.salutation || "",
    firstName: req.body.firstName || "",
    lastName: req.body.lastName || "",
    nickname: req.body.nickname || "",
    dob: req.body.dob || "",
    gender: req.body.gender || "",
    email: req.body.email || "",
    contactMethod: req.body.contactMethod || "",
    memberType: req.body.memberType || "",
    photo: req.body.photo || "",
    bio: req.body.bio || "",
    location: req.body.location || "",
    allowContactShare:
      req.body.allowContactShare !== undefined
        ? req.body.allowContactShare
        : false,
    phone: req.body.phone || "",
    age: req.body.age ? Number(req.body.age) : 18,
    matchingPreferences: {
      ageRange: {
        min: req.body.matchingPreferences?.ageRange?.min ?? 18,
        max: req.body.matchingPreferences?.ageRange?.max ?? 100,
      },
      locationPreference: req.body.matchingPreferences?.locationPreference || "Global",
      preferredMemberTypes: Array.isArray(req.body.matchingPreferences?.preferredMemberTypes)
        ? req.body.matchingPreferences.preferredMemberTypes
        : [],
    },
    skills: Array.isArray(req.body.skills)
      ? req.body.skills
          .map((skill) =>
            typeof skill === "string" ? skill : skill.name || ""
          )
          .filter(Boolean)
      : [],
    preferences: Array.isArray(req.body.preferences) ? req.body.preferences : [],
  };

  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user },
      { $set: profileFields },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json(profile);
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;