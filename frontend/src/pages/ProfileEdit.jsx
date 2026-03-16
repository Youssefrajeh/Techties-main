import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import PhotoUpload from "../components/PhotoUpload";
import SkillsInput from "../components/SkillsInput";
import { getSession } from "../utils/auth";
import { getProfile, saveProfile, EMPTY_PROFILE } from "../utils/profileStore";
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

export default function ProfileEdit() {
  const navigate = useNavigate();
  const session = getSession();
  const sessionEmail = session?.email || "";

  const [profile, setProfile] = useState({ ...EMPTY_PROFILE });
  const [errors, setErrors] = useState({});
  const [photoError, setPhotoError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!sessionEmail) {
      navigate("/login");
      return;
    }

    const existing = getProfile(sessionEmail);

    if (existing) {
      setProfile((prev) => {
        const next = { ...EMPTY_PROFILE, ...existing };
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
    } else {
      navigate("/profile/setup");
    }
  }, [sessionEmail, navigate]);

  const update = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    setSuccess(false);
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
    setSuccess(false);

    if (!error && errors.photo) {
      setErrors((prev) => ({ ...prev, photo: "" }));
    }
  };

  const handleSkillsChange = (skills) => {
    setProfile((prev) => ({ ...prev, skills }));

    if (skills.length > 0 && errors.skills) {
      setErrors((prev) => ({ ...prev, skills: "" }));
    }

    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    const existingProfile = getProfile(sessionEmail);
    const normalizedExisting = { ...EMPTY_PROFILE, ...existingProfile };
    const normalizedCurrent = { ...EMPTY_PROFILE, ...profile };

    if (JSON.stringify(normalizedExisting) === JSON.stringify(normalizedCurrent)) {
      setErrors({ form: "No changes detected." });
      return;
    }

    const errs = validateProfile(profile);
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      const firstErrorEl = document.querySelector(
        ".input-group__field--error, .select-group__field--error, .photo-upload__preview--error, .skills-input__box"
      );
      firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      if (token) {
        const payload = { ...profile };

        const res = await fetch("/api/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to save profile to server.");
        }
      }

      saveProfile(sessionEmail, profile);

      navigate("/dashboard", {
      state: { profileUpdated: true }
      });
    } catch (err) {
      console.error("Error saving profile:", err);
      setErrors({ form: err.message || "Failed to save profile to server." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-setup">
      <div className="profile-setup__container">
        <div className="profile-setup__header">
          <h1 className="profile-setup__title">Edit Your Profile</h1>
          <p className="profile-setup__subtitle">
            Update your information and skills.
          </p>
        </div>

        {success && (
          <div className="profile-edit__success" role="status">
            ✓ Profile updated successfully!
          </div>
        )}

        {errors.form && (
          <div className="login-form__error" role="alert">
            {errors.form}
          </div>
        )}

        <form className="profile-setup__form" onSubmit={handleSubmit} noValidate>
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
                value={profile.firstName}
                onChange={handleFirstNameChange}
                error={errors.firstName}
                required
              />

              <Input
                id="lastName"
                label="Last Name"
                value={profile.lastName}
                onChange={handleLastNameChange}
                error={errors.lastName}
                required
              />

              <Input
                id="nickname"
                label="Nickname"
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
                onChange={(e) => update("dob", e.target.value)}
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
                    style={{ width: "1.2rem", height: "1.2rem" }}
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

          {/* Actions */}
          <div
            className="profile-setup__actions"
            style={{ display: "flex", gap: "var(--space-4)" }}
          >
            <Button variant="secondary" size="lg" to="/dashboard" style={{ flex: 1 }}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={saving}
              disabled={saving}
              style={{ flex: 2 }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
