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
  const [sendSuccess, setSendSuccess] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    // Reset success message when modal opens/closes
    if (!showMessageModal) {
      setSendSuccess(false);
      setMessageSubject("");
      setMessageContent("");
    }
  }, [showMessageModal]);

  const handleSendMessage = async () => {
    setSendingMessage(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: userId,
          subject: messageSubject,
          content: messageContent,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      setSendSuccess(true);
      setTimeout(() => setShowMessageModal(false), 2000);
    } catch (err) {
      console.error("Send message error:", err);
      alert("Error sending message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

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
              <Button 
                variant="primary" 
                onClick={() => setShowMessageModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                ✉️ Send Message
              </Button>
            </div>

            {/* Send Message Modal */}
            {showMessageModal && (
              <div className="message-modal-overlay" onClick={() => setShowMessageModal(false)} style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
              }}>
                <div className="message-modal" onClick={e => e.stopPropagation()} style={{
                  backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '500px'
                }}>
                  <h2 style={{ marginBottom: '1.5rem' }}>Send Message to {displayName}</h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Subject</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      placeholder="Enter subject..."
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Message</label>
                    <textarea 
                      className="admin-input" 
                      style={{ width: '100%', minHeight: '150px', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type your message here..."
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button 
                      className="admin-btn admin-btn--outline" 
                      onClick={() => setShowMessageModal(false)}
                      disabled={sendingMessage}
                    >
                      Cancel
                    </button>
                    <button 
                      className="admin-btn admin-btn--primary" 
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !messageSubject.trim() || !messageContent.trim()}
                    >
                      {sendingMessage ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                  {sendSuccess && <p style={{ color: 'green', marginTop: '1rem' }}>Message sent!</p>}
                </div>
              </div>
            )}
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
