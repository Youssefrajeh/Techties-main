const Profile = require("../models/Profile");

exports.createProfile = async (req, res) => {
  try {
    const profileData = {
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
      skills: Array.isArray(req.body.skills) ? req.body.skills : [],
      preferences: Array.isArray(req.body.preferences) ? req.body.preferences : [],
    };

    const profile = await Profile.findOneAndUpdate(
      { user: req.user },
      { $set: profileData },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (error) {
    console.error("Create profile error:", error);
    res.status(500).send("Server error");
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user });
    res.json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).send("Server error");
  }
};