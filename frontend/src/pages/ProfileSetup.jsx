import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import PhotoUpload from "../components/PhotoUpload";
import SkillsInput from "../components/SkillsInput";
import { getSession, clearNewUserFlag } from "../utils/auth";
import { saveProfile, EMPTY_PROFILE } from "../utils/profileStore";
import { computeAge } from "../utils/dateUtils";
import "./ProfileSetup.css";

const SALUTATION_OPTIONS = [
  { value: "Mr", label: "Mr" },
  { value: "Ms", label: "Ms" },
  { value: "Mrs", label: "Mrs" },
  { value: "Dr", label: "Dr" },
  { value: "Prof", label: "Prof" },
  { value: "Other", label: "Other" },
];

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

const CONTACT_OPTIONS = [
  { value: "Email", label: "Email" },
  { value: "Phone", label: "Phone" },
  { value: "Discord", label: "Discord" },
  { value: "Slack", label: "Slack" },
  { value: "LinkedIn", label: "LinkedIn" },
];

const MEMBER_TYPE_OPTIONS = [
  { value: "Developer", label: "Developer" },
  { value: "Designer", label: "Designer" },
  { value: "Product Manager", label: "Product Manager" },
  { value: "Data Scientist", label: "Data Scientist" },
  { value: "DevOps Engineer", label: "DevOps Engineer" },
  { value: "Student", label: "Student" },
  { value: "Other", label: "Other" },
];

const nameRegex = /^[A-Za-z\s'-]+$/;

function validateProfile(profile) {
  const errors = {};

  if (!profile.salutation) errors.salutation = "Please select a salutation.";

  if (!profile.firstName.trim()) {
    errors.firstName = "First name is required.";
  } else if (!nameRegex.test(profile.firstName.trim())) {
    errors.firstName = "First name can only contain letters.";
  }

  if (!profile.lastName.trim()) {
    errors.lastName = "Last name is required.";
  } else if (!nameRegex.test(profile.lastName.trim())) {
    errors.lastName = "Last name can only contain letters.";
  }

  if (!profile.nickname.trim()) errors.nickname = "Nickname is required.";
  if (!profile.dob) errors.dob = "Date of birth is required.";
  if (!profile.gender) errors.gender = "Please select a gender.";
  if (!profile.contactMethod) {
    errors.contactMethod = "Please select a contact method.";
  }
  if (!profile.memberType) errors.memberType = "Please select a member type.";



  if (!profile.skills || profile.skills.length === 0) {
    errors.skills = "Please add at least one skill.";
  } else if (profile.skills.length > 10) {
    errors.skills = "You can add up to 10 skills.";
  }

  return errors;
}

export default function ProfileSetup() {
  const navigate = useNavigate();
  const session = getSession();
  const sessionEmail = session?.email || "";

  const [profile, setProfile] = useState({
    ...EMPTY_PROFILE,
    email: sessionEmail,
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    update("firstName", value);

    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, firstName: "First name is required." }));
    } else if (!nameRegex.test(value.trim())) {
      setErrors((prev) => ({
        ...prev,
        firstName: "First name can only contain letters.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, firstName: "" }));
    }
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    update("lastName", value);

    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, lastName: "Last name is required." }));
    } else if (!nameRegex.test(value.trim())) {
      setErrors((prev) => ({
        ...prev,
        lastName: "Last name can only contain letters.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, lastName: "" }));
    }
  };

  const handlePhotoChange = (base64, error) => {
    setProfile((prev) => ({ ...prev, photo: base64 }));
    setPhotoError(error || "");

    if (!error && errors.photo) {
      setErrors((prev) => ({ ...prev, photo: "" }));
    }
  };

  const handleDobChange = (e) => {
    const dob = e.target.value;
    const age = computeAge(dob);
    setProfile((prev) => ({
      ...prev,
      dob,
      age: age !== null ? age : prev.age,
    }));

    if (errors.dob) {
      setErrors((prev) => ({ ...prev, dob: "" }));
    }
  };

  const handleSkillsChange = (skills) => {
    setProfile((prev) => ({ ...prev, skills }));

    if (skills.length > 0 && errors.skills) {
      setErrors((prev) => ({ ...prev, skills: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setFormError("");

    const errs = validateProfile(profile);
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      const fieldLabels = {
        salutation: "Salutation",
        firstName: "First name",
        lastName: "Last name",
        nickname: "Nickname",
        dob: "Date of birth",
        gender: "Gender",
        contactMethod: "Preferred contact method",
        memberType: "Member type",
        photo: "Profile photo",
        skills: "Skills (add at least one)",
      };

      const missing = Object.keys(errs)
        .filter((key) => errs[key])
        .map((key) => fieldLabels[key] || key);

      setFormError(
        missing.length > 0
          ? `Please complete: ${missing.join(", ")}.`
          : "Please fix the errors below before continuing."
      );

      const firstErrorEl = document.querySelector(
        ".input-group__field--error, .select-group__field--error, .photo-upload__preview--error, .skills-input__box"
      );
      firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!sessionEmail) {
      setFormError("Session expired. Please log in again.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const token = localStorage.getItem("token");

      if (token) {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setFormError(data.message || "Failed to save profile. Please try again.");
          return;
        }
      }

      saveProfile(sessionEmail, profile);
      clearNewUserFlag();
      navigate("/dashboard", { state: { fromProfileSetup: true } });
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-setup">
      <div className="profile-setup__container">
        <div className="profile-setup__header">
          <h1 className="profile-setup__title">Set Up Your Profile</h1>
          <p className="profile-setup__subtitle">
            Tell us about yourself so we can find the best connections for you.
          </p>
        </div>

        <form className="profile-setup__form" onSubmit={handleSubmit} noValidate>
          {formError && (
            <div className="profile-setup__form-error" role="alert">
              {formError}
            </div>
          )}

          {/* Section 1 — Personal Info */}
          <fieldset className="profile-setup__section">
            <legend className="profile-setup__legend">
              <span className="profile-setup__legend-number">1</span>
              Personal Information
            </legend>

            <div className="profile-setup__grid">
              <Select
                id="salutation"
                label="Salutation"
                value={profile.salutation}
                onChange={(e) => update("salutation", e.target.value)}
                options={SALUTATION_OPTIONS}
                error={errors.salutation}
                required
              />

              <div />

              <Input
                id="firstName"
                label="First Name"
                placeholder="Alex"
                value={profile.firstName}
                onChange={handleFirstNameChange}
                error={errors.firstName}
                required
              />

              <Input
                id="lastName"
                label="Last Name"
                placeholder="Johnson"
                value={profile.lastName}
                onChange={handleLastNameChange}
                error={errors.lastName}
                required
              />

              <Input
                id="nickname"
                label="Nickname"
                placeholder="alexj"
                value={profile.nickname}
                onChange={(e) => update("nickname", e.target.value)}
                error={errors.nickname}
                required
              />

              <Input
                id="dob"
                label="Date of Birth"
                type="date"
                value={profile.dob}
                onChange={handleDobChange}
                error={errors.dob}
                required
              />

              <Select
                id="gender"
                label="Gender"
                value={profile.gender}
                onChange={(e) => update("gender", e.target.value)}
                options={GENDER_OPTIONS}
                error={errors.gender}
                required
              />

              <Input
                id="age"
                label="Age"
                type="number"
                value={profile.age}
                onChange={(e) => update("age", parseInt(e.target.value) || 18)}
                error={errors.age}
                min="18"
                max="100"
              />
            </div>
          </fieldset>

          {/* Section 2 — Contact */}
          <fieldset className="profile-setup__section">
            <legend className="profile-setup__legend">
              <span className="profile-setup__legend-number">2</span>
              Contact & Membership
            </legend>

            <div className="profile-setup__grid">
              <Input
                id="email"
                label="Email"
                type="email"
                value={profile.email}
                onChange={() => {}}
                disabled
              />

              <Input
                id="phone"
                label="Phone Number"
                type="tel"
                value={profile.phone || ""}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="e.g. +1 555-0123"
              />

              <Select
                id="contactMethod"
                label="Preferred Contact Method"
                value={profile.contactMethod}
                onChange={(e) => update("contactMethod", e.target.value)}
                options={CONTACT_OPTIONS}
                error={errors.contactMethod}
                required
              />

              <Select
                id="memberType"
                label="Member Type"
                value={profile.memberType}
                onChange={(e) => update("memberType", e.target.value)}
                options={MEMBER_TYPE_OPTIONS}
                error={errors.memberType}
                required
              />

              <Input
                id="location"
                label="Location"
                placeholder="London, Ontario"
                value={profile.location}
                onChange={(e) => update("location", e.target.value)}
              />

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  htmlFor="bio"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    color: "var(--color-text, #111827)",
                  }}
                >
                  Bio <span style={{ fontWeight: 400, color: "#6b7280" }}>(Optional)</span>
                </label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  placeholder="Tell others a bit about yourself, your interests, and what kind of tech connection you're looking for."
                  rows={4}
                  maxLength={300}
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    border: "1px solid var(--color-border, #d1d5db)",
                    padding: "0.875rem 1rem",
                    font: "inherit",
                    resize: "vertical",
                    background: "var(--color-white, #fff)",
                  }}
                />
                <div
                  style={{
                    marginTop: "0.35rem",
                    fontSize: "0.85rem",
                    color: "#6b7280",
                    textAlign: "right",
                  }}
                >
                  {profile.bio.length}/300
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1", marginTop: "0.5rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={profile.allowContactShare || false}
                    onChange={(e) => update("allowContactShare", e.target.checked)}
                    style={{ width: "1.1rem", height: "1.1rem" }}
                  />
                  <span>
                    Allow my contact information to be shared with potential matches
                  </span>
                </label>
              </div>
            </div>
          </fieldset>

          {/* Section 3 — Photo */}
          <fieldset className="profile-setup__section">
            <legend className="profile-setup__legend">
              <span className="profile-setup__legend-number">3</span>
              Profile Photo
            </legend>

            <PhotoUpload
              value={profile.photo}
              onChange={handlePhotoChange}
              error={photoError || errors.photo}
            />
          </fieldset>

          {/* Section 4 — Skills */}
          <fieldset className="profile-setup__section">
            <legend className="profile-setup__legend">
              <span className="profile-setup__legend-number">4</span>
              Your Skills
            </legend>

            <SkillsInput
              skills={profile.skills}
              onChange={handleSkillsChange}
              error={errors.skills}
            />
          </fieldset>

          {/* Section 5 — Matching Preferences */}
          <fieldset className="profile-setup__section">
            <legend className="profile-setup__legend">
              <span className="profile-setup__legend-number">5</span>
              Matching Preferences
            </legend>

            <div className="profile-setup__grid">
              <div style={{ display: "flex", gap: "1rem" }}>
                <Input
                  id="ageMin"
                  label="Min Age"
                  type="number"
                  value={profile.matchingPreferences?.ageRange?.min || 18}
                  onChange={(e) => {
                    const min = parseInt(e.target.value) || 18;
                    update("matchingPreferences", {
                      ...profile.matchingPreferences,
                      ageRange: { ...profile.matchingPreferences.ageRange, min }
                    });
                  }}
                  min="18" max="100"
                />
                <Input
                  id="ageMax"
                  label="Max Age"
                  type="number"
                  value={profile.matchingPreferences?.ageRange?.max || 100}
                  onChange={(e) => {
                    const max = parseInt(e.target.value) || 100;
                    update("matchingPreferences", {
                      ...profile.matchingPreferences,
                      ageRange: { ...profile.matchingPreferences.ageRange, max }
                    });
                  }}
                  min="18" max="100"
                />
              </div>

              <Select
                id="locationPreference"
                label="Location Preference"
                value={profile.matchingPreferences?.locationPreference || "Global"}
                onChange={(e) => update("matchingPreferences", {
                  ...profile.matchingPreferences,
                  locationPreference: e.target.value
                })}
                options={[
                  { value: "Local", label: "Local Only" },
                  { value: "Same Country", label: "Same Country" },
                  { value: "Global", label: "Global" },
                ]}
              />

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Preferred Member Types
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {MEMBER_TYPE_OPTIONS.map(opt => (
                    <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: "#f3f4f6", padding: "0.25rem 0.5rem", borderRadius: "4px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={profile.matchingPreferences?.preferredMemberTypes?.includes(opt.value)}
                        onChange={(e) => {
                          const types = profile.matchingPreferences?.preferredMemberTypes || [];
                          const nextTypes = e.target.checked
                            ? [...types, opt.value]
                            : types.filter(t => t !== opt.value);
                          update("matchingPreferences", {
                            ...profile.matchingPreferences,
                            preferredMemberTypes: nextTypes
                          });
                        }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </fieldset>

          {/* Submit */}
          <div className="profile-setup__actions">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={saving}
              disabled={saving}
            >
              {saving ? "Saving profile…" : "Complete Profile Setup"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
