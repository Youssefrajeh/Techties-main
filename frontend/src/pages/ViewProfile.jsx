import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Button from "../components/Button";
import "./ViewProfile.css";

export default function ViewProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revealedContact, setRevealedContact] = useState(null);
  const [revealLoading, setRevealLoading] = useState(false);
  const [revealError, setRevealError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Could not load profile.");
        }

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleRevealContact = async () => {
    setRevealLoading(true);
    setRevealError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/matches/contact/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.msg || "Failed to reveal contact.");
      }
      const data = await res.json();
      setRevealedContact(data);
    } catch (err) {
      setRevealError(err.message);
    } finally {
      setRevealLoading(false);
    }
  };

  // Build display name from profile fields
  const displayName = profile
    ? `${profile.salutation ? `${profile.salutation} ` : ""}${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
      profile.user?.name ||
      "Unknown User"
    : "";

  // ── Loading state ──
  if (loading) {
    return (
      <div className="view-profile">
        <div className="view-profile__container view-profile__loading">
          <div className="view-profile__spinner" />
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !profile) {
    return (
      <div className="view-profile">
        <div className="view-profile__container view-profile__error">
          <p>{error || "Profile not found."}</p>
          <button className="view-profile__back" onClick={() => navigate(-1)}>
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-profile">
      <nav className="dashboard__nav">
        <a href="/" className="dashboard__nav-brand">TechTies</a>
        <div className="dashboard__nav-actions">
          <a href="/matches" className="button button--ghost button--sm">Matches</a>
          <a href="/dashboard" className="button button--secondary button--sm">Dashboard</a>
        </div>
      </nav>

      <div className="view-profile__container">
        <button className="view-profile__back" onClick={() => navigate("/matches")}>
          ← Back to Matches
        </button>

        <div className="view-profile__card">
          {/* ── Header ── */}
          <div className="view-profile__header">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt="Profile"
                className="view-profile__avatar"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <div className="view-profile__avatar-placeholder">
                {(profile.firstName?.[0] || profile.user?.name?.[0] || "?").toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="view-profile__name">{displayName}</h1>
              {profile.nickname && (
                <p className="view-profile__nickname">@{profile.nickname}</p>
              )}
              {profile.role && (
                <p className="view-profile__role" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{profile.role}</p>
              )}
              <div className="view-profile__badges">
                {profile.memberType && (
                  <span className="view-profile__badge">{profile.memberType}</span>
                )}
              </div>
            </div>

            <div className="view-profile__actions">
              {profile && profile.allowContactShare ? (
                <>
                  {!revealedContact ? (
                    <Button 
                      variant="primary" 
                      onClick={handleRevealContact}
                      disabled={revealLoading}
                    >
                      {revealLoading ? "Revealing..." : "👁️ Reveal Contact Info"}
                    </Button>
                  ) : (
                    <div className="revealed-contact-box" style={{ 
                      padding: "1rem", 
                      backgroundColor: "#f0fdf4", 
                      borderRadius: "12px", 
                      border: "1px solid #bcf0da",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
                    }}>
                      <div style={{ fontWeight: 700, color: "#065f46", marginBottom: "0.5rem" }}>
                        ✅ Contact Method: {revealedContact.contactMethod || "External"}
                      </div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#047857", marginBottom: "0.5rem" }}>
                        {revealedContact.contactIdentifier}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#059669" }}>
                        Email: <a href={`mailto:${revealedContact.email}`} style={{ color: "#059669", fontWeight: 600 }}>{revealedContact.email}</a>
                      </div>
                    </div>
                  )}
                  {revealError && <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.5rem" }}>{revealError}</p>}
                </>
              ) : (
                <p className="view-profile__muted" style={{ fontSize: "0.9rem", color: "#64748b", fontStyle: "italic" }}>
                  This user has not enabled contact sharing.
                </p>
              )}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="view-profile__body">
            {/* Bio */}
            {profile.bio && (
              <div className="view-profile__section">
                <h3 className="view-profile__section-title">About</h3>
                <p className="view-profile__bio">"{profile.bio}"</p>
              </div>
            )}

            {/* Details */}
            <div className="view-profile__section">
              <h3 className="view-profile__section-title">Details</h3>
              <div className="view-profile__detail-grid">
                {profile.location && (
                  <div className="view-profile__detail-item">
                    <span className="view-profile__detail-label">📍 Location</span>
                    <span className="view-profile__detail-value">{profile.location}</span>
                  </div>
                )}
                <div className="view-profile__detail">
                  <span className="view-profile__detail-label">💬 Contact Method</span>
                  <span className="view-profile__detail-value">
                    {profile.contactMethod || "—"} 
                    {profile.contactIdentifier && ` (${profile.contactIdentifier})`}
                  </span>
                </div>
                {profile.age && (
                  <div className="view-profile__detail-item">
                    <span className="view-profile__detail-label">🎂 Age</span>
                    <span className="view-profile__detail-value">{profile.age} years old</span>
                  </div>
                )}
                {profile.gender && (
                  <div className="view-profile__detail-item">
                    <span className="view-profile__detail-label">⚧ Gender</span>
                    <span className="view-profile__detail-value">{profile.gender}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {Array.isArray(profile.skills) && profile.skills.length > 0 && (
              <div className="view-profile__section">
                <h3 className="view-profile__section-title">Skills</h3>
                <div className="view-profile__skills-list">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="view-profile__skill-pill">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact info — only shown if the user allows contact sharing */}
            {(profile.email || profile.phone) && (
              <div className="view-profile__section">
                <h3 className="view-profile__section-title">Contact</h3>
                <ul className="view-profile__contact-list">
                  {profile.email && (
                    <li>📧 <a href={`mailto:${profile.email}`}>{profile.email}</a></li>
                  )}
                  {profile.phone && <li>📞 {profile.phone}</li>}
                  {profile.contactMethod && <li>💬 Preferred: {profile.contactMethod}</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
