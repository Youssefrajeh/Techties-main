import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import { getSession, logout } from "../utils/auth";
import { getProfile, hasProfile, saveProfile } from "../utils/profileStore";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromProfileUpdate = location.state?.profileUpdated === true;


  const session = getSession();
  const sessionEmail = session?.email || "";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interests, setInterests] = useState([]);
  const [interestsLoading, setInterestsLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeStatus, setUpgradeStatus] = useState(null); // 'pending', 'none'
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [isPaidUser, setIsPaidUser] = useState(session?.isPaid || false);

  const fromProfileSetup = location.state?.fromProfileSetup === true;

  const loadInterests = async () => {
    setInterestsLoading(true);
    try {
      const res = await fetch('/api/matches/received-interest', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setInterests(data);
      }
    } catch (err) {
      console.error('Failed to load interests:', err);
    } finally {
      setInterestsLoading(false);
    }
  };

  const checkUpgradeStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('/api/auth/upgrade-status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUpgradeStatus(data.status);
        setIsPaidUser(data.isPaid);
      }
    } catch (err) {
      console.error('Failed to check upgrade status:', err);
    }
  };

  const handleRequestUpgrade = async () => {
    setUpgradeLoading(true);
    setUpgradeMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/request-upgrade", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUpgradeStatus("pending");
        setUpgradeMessage(data.msg);
      } else {
        setUpgradeMessage(data.msg || "Failed to submit request.");
      }
    } catch (err) {
      setUpgradeMessage("Network error. Please try again.");
    } finally {
      setUpgradeLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionEmail) {
      navigate("/login");
      return;
    }
    if (session?.role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    const token = localStorage.getItem("token");

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        if (token) {
          const res = await fetch("/api/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();

            const profileData = {
              salutation: data.salutation || "",
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              nickname: data.nickname || "",
              dob: data.dob || "",
              gender: data.gender || "",
              email: data.email || sessionEmail,
              contactMethod: data.contactMethod || "",
              memberType: data.memberType || "",
              photo: data.photo || "",
              skills: Array.isArray(data.skills) ? data.skills : [],
              bio: data.bio || "",
              location: data.location || "",
              age: data.age || null,
              phone: data.phone || "",
            };

            saveProfile(sessionEmail, profileData);
            setProfile(profileData);
            await loadInterests();
            await checkUpgradeStatus();
            return;
          }
        }

        if (hasProfile(sessionEmail)) {
          const localProfile = getProfile(sessionEmail);
          setProfile({
            ...localProfile,
            bio: localProfile?.bio || "",
            location: localProfile?.location || "",
            skills: Array.isArray(localProfile?.skills) ? localProfile.skills : [],
          });
          return;
        }

        navigate("/profile/setup");
      } catch (err) {
        console.error("Error loading dashboard profile:", err);

        if (hasProfile(sessionEmail)) {
          const localProfile = getProfile(sessionEmail);
          setProfile({
            ...localProfile,
            bio: localProfile?.bio || "",
            location: localProfile?.location || "",
            skills: Array.isArray(localProfile?.skills) ? localProfile.skills : [],
          });
        } else {
          setError("Could not load profile.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [sessionEmail, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = useMemo(() => {
    if (!profile) return "";
    return `${profile.salutation ? `${profile.salutation} ` : ""}${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  }, [profile]);

  const topSkills = useMemo(() => {
    if (!profile?.skills || !Array.isArray(profile.skills)) return [];
    return profile.skills.slice(0, 3);
  }, [profile]);

  if (loading && !profile) {
    return (
      <div className="dashboard dashboard--loading">
        <div className="dashboard-loading">
          <span className="dashboard-loading__spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="dashboard dashboard--loading">
        <div className="dashboard-loading dashboard-loading--error">
          <p>{error}</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/profile/setup")}
          >
            Set up profile
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="dashboard">
      <nav className="dashboard__nav">
        <Link to="/" className="dashboard__nav-brand">
          TechTies
        </Link>

        <div className="dashboard__nav-actions">
          <Button variant="ghost" size="sm" to="/profile/edit">
            Edit Profile
          </Button>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </nav>

      <div className="dashboard__container">
      {fromProfileSetup && (
  <div className="dashboard__success-banner" role="alert">
    Your profile is all set. Welcome to TechTies!
  </div>
)}

{fromProfileUpdate && (
  <div className="dashboard__success-banner" role="alert">
    ✓ Profile updated successfully!
  </div>
)}

{location.state?.adminDenied && (
  <div className="dashboard__admin-denied-banner" role="alert">
    Only admin accounts can access the Admin page. Log in with an admin account to continue.
  </div>
)}

{upgradeMessage && (
  <div className={`dashboard__${upgradeStatus === "pending" ? "success" : "error"}-banner`} role="alert">
    {upgradeMessage}
  </div>
)}

        <div className="dashboard__welcome">
          <h1>Welcome{profile.firstName ? `, ${profile.firstName}` : ""}! 👋</h1>
          <p>Here's your profile overview and quick actions.</p>
        </div>

        <div className="dashboard__grid">
          {/* Profile Card */}
          <div className="dashboard__card dashboard__profile-card">
            <div className="dashboard__avatar">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt="Profile"
                  className="dashboard__avatar-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="dashboard__avatar-initials">
                  {profile.firstName?.[0] || ""}
                  {profile.lastName?.[0] || ""}
                </span>
              )}
            </div>

            <h2 className="dashboard__name">{displayName}</h2>
            <p className="dashboard__nickname">
              {profile.nickname ? `@${profile.nickname}` : ""}
            </p>

            {profile.memberType && (
              <span className="dashboard__member-badge">{profile.memberType}</span>
            )}

            {profile.bio && (
              <p className="dashboard__bio">{profile.bio}</p>
            )}

            {profile.location && (
              <p className="dashboard__location">📍 {profile.location}</p>
            )}

            <div className="dashboard__main">
            <section className="dashboard__section">
              <h2 className="dashboard__section-title">People Interested in You</h2>
              <div className="dashboard__card" style={{ padding: '0' }}>
                {interestsLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading interests...</div>
                ) : interests.length > 0 ? (
                  <div className="dashboard__interests-list">
                    {interests.map((item, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          padding: '1rem 1.5rem', 
                          borderBottom: idx === interests.length - 1 ? 'none' : '1px solid #f1f5f9',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <Link to={`/profile/view/${item.userId}`} style={{ fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
                            {item.userName}
                          </Link>
                          <span style={{ marginLeft: '0.5rem', color: '#475569' }}>
                            {item.type === 'like' ? '❤️ liked your profile' : '👁️ revealed your contact info'}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                            {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" to={`/profile/view/${item.userId}`}>
                          View Profile
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No one has shown interest yet. Keep improving your profile!
                  </div>
                )}
              </div>
            </section>


            </div>

            <div className="dashboard__details">
              <div className="dashboard__detail">
                <span className="dashboard__detail-label">📧 Email</span>
                <span className="dashboard__detail-value">{profile.email || "—"}</span>
              </div>

              {profile.phone && (
                <div className="dashboard__detail">
                  <span className="dashboard__detail-label">📞 Phone</span>
                  <span className="dashboard__detail-value">{profile.phone}</span>
                </div>
              )}

              <div className="dashboard__detail">
                <span className="dashboard__detail-label">⚧ Gender</span>
                <span className="dashboard__detail-value">{profile.gender || "—"}</span>
              </div>

              {profile.age && (
                <div className="dashboard__detail">
                  <span className="dashboard__detail-label">🎂 Age</span>
                  <span className="dashboard__detail-value">{profile.age} years old</span>
                </div>
              )}

              <div className="dashboard__detail">
                <span className="dashboard__detail-label">🗓️ Date of Birth</span>
                <span className="dashboard__detail-value">{profile.dob || "—"}</span>
              </div>

              <div className="dashboard__detail">
                <span className="dashboard__detail-label">💬 Contact Method</span>
                <span className="dashboard__detail-value">
                  {profile.contactMethod || "—"}
                </span>
              </div>
            </div>
          </div>


          {/* Skills Card */}
<div className="dashboard__card dashboard__skills-card">
  <h3 className="dashboard__card-title">Your Skills</h3>


  {Array.isArray(profile.skills) && profile.skills.length > 0 ? (
    <div className="dashboard__skills-grid">
      {profile.skills.map((skill, index) => {
        const skillName =
          typeof skill === "string" ? skill : skill?.name || `Skill ${index + 1}`;

        return (
          <div key={`${skillName}-${index}`} className="dashboard__skill-pill">
            {skillName}
          </div>
        );
      })}
    </div>
  ) : (
    <p className="dashboard__no-skills">
      No skills added yet. <Link to="/profile/edit">Add some!</Link>
    </p>
  )}
</div>


          {/* Quick Actions */}
          <div className="dashboard__card dashboard__actions-card">
            <h3 className="dashboard__card-title">Quick Actions</h3>

            <div className="dashboard__quick-actions">
              {isPaidUser && (
                <Button variant="primary" fullWidth to="/matches">
                  🤝 View Match Recommendations
                </Button>
              )}

              {!isPaidUser && upgradeStatus !== 'pending' && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleRequestUpgrade}
                  disabled={upgradeLoading}
                  style={{ marginTop: "0.5rem", background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none' }}
                >
                  {upgradeLoading ? "Submitting..." : "🚀 Upgrade to Premium"}
                </Button>
              )}

              {!isPaidUser && upgradeStatus === 'pending' && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.75rem', 
                  backgroundColor: '#f0fdf4', 
                  color: '#166534', 
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  border: '1px solid #bbf7d0',
                  fontWeight: 500
                }}>
                  ⏳ Upgrade Request Pending
                </div>
              )}

              {session?.role === "admin" && (
                <Button
                  variant="secondary"
                  fullWidth
                  to="/admin"
                  style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}
                >
                  📊 Admin
                </Button>
              )}

              <Button
                variant="outline"
                fullWidth
                to="/inbox"
                style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}
              >
                ✉️ Inbox
              </Button>

              <Button
                variant="outline"
                fullWidth
                to="/profile/edit"
                style={{ marginTop: "0.5rem" }}
              >
                ✏️ Edit Profile
              </Button>

              <Button
                variant="ghost"
                fullWidth
                to="/"
                style={{ marginTop: "0.5rem" }}
              >
                🏠 Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
