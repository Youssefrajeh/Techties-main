/**
 * TechTies Profile Store
 * ─────────────────────────────────────────────────────
 * localStorage CRUD for user profiles.
 */

const PROFILES_KEY = "techties_profiles";

/* ── Helpers ──────────────────────────────────────── */

function getAllProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

/* ── Public API ───────────────────────────────────── */

/**
 * Get a user's profile by email.
 * @param {string} email
 * @returns {object|null}
 */
export function getProfile(email) {
  if (!email) return null;
  const profiles = getAllProfiles();
  return profiles[email.toLowerCase()] || null;
}

/**
 * Check if a user has a profile.
 * @param {string} email
 * @returns {boolean}
 */
export function hasProfile(email) {
  return getProfile(email) !== null;
}

/**
 * Create or update a user's profile.
 * @param {string} email
 * @param {object} profileData
 * @returns {object} The saved profile
 */
export function saveProfile(email, profileData) {
  if (!email) throw new Error("Email is required to save a profile.");

  const profiles = getAllProfiles();
  const key = email.toLowerCase();
  const existingProfile = profiles[key] || {};

  profiles[key] = {
    ...EMPTY_PROFILE,
    ...existingProfile,
    ...profileData,
    email: key,
    updatedAt: Date.now(),
    createdAt: existingProfile.createdAt || Date.now(),
  };

  saveAllProfiles(profiles);
  return profiles[key];
}

/**
 * Delete a user's profile.
 * @param {string} email
 */
export function deleteProfile(email) {
  if (!email) return;
  const profiles = getAllProfiles();
  delete profiles[email.toLowerCase()];
  saveAllProfiles(profiles);
}

/**
 * Default empty profile shape.
 */
export const EMPTY_PROFILE = {
  salutation: "",
  firstName: "",
  lastName: "",
  nickname: "",
  dob: "",
  gender: "",
  email: "",
  contactMethod: "",
  contactIdentifier: "",
  role: "",
  memberType: "",
  photo: "",
  bio: "",
  location: "",
  allowContactShare: false,
  phone: "",
  age: 18,
  matchingPreferences: {
    ageRange: { min: 18, max: 100 },
    locationPreference: "Global",
    preferredMemberTypes: [],
  },
  skills: [], // [{ name: string, rank: number }]
};
