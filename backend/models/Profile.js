const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    salutation: {
      type: String,
      default: "",
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    nickname: {
      type: String,
      default: "",
    },
    dob: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    contactMethod: {
      type: String,
      default: "",
    },
    memberType: {
      type: String,
      default: "",
    },
    photo: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    allowContactShare: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    age: {
      type: Number,
      default: 18,
    },
    matchingPreferences: {
      ageRange: {
        min: { type: Number, default: 18 },
        max: { type: Number, default: 100 },
      },
      locationPreference: {
        type: String,
        default: "Global",
      },
      preferredMemberTypes: {
        type: [String],
        default: [],
      },
    },
    preferences: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema);