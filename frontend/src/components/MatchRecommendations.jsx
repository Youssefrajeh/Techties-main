import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MatchRecommendations.css'; // We will create this

const ContactRevealer = ({ userId }) => {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const revealContact = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/matches/contact/${userId}`, {
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to fetch contact');
      setContact(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (contact) {
    return (
      <div className="revealed-contact">
        <div>Email: <a href={`mailto:${contact.email}`}>{contact.email}</a></div>
        <div>Phone: {contact.phone}</div>
      </div>
    );
  }

  return (
    <div className="contact-reveal-container">
      {error && <span className="reveal-error">{error}</span>}
      <button 
        className="button button--sm button--ghost" 
        onClick={revealContact}
        disabled={loading}
        style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
      >
        {loading ? 'Revealing...' : '👁️ Reveal Contact Info'}
      </button>
    </div>
  );
};

const MatchRecommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dummy fetch to represent calling the new API until we have auth wired up in the UI
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to see match recommendations.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/matches/recommendations', {
          headers: {
            'Authorization': token,
          },
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.msg || 'Failed to fetch recommendations');
        }

        setRecommendations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <nav className="dashboard__nav">
          <a href="/" className="dashboard__nav-brand">TechTies</a>
          <div className="dashboard__nav-actions">
            <a href="/profile/edit" className="button button--ghost button--sm">Edit Profile</a>
            <a href="/dashboard" className="button button--secondary button--sm">Dashboard</a>
          </div>
        </nav>
        <div className="dashboard__container">
          <div className="loading-state" style={{ textAlign: "center", padding: "4rem" }}>Finding your best matches...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <nav className="dashboard__nav">
          <a href="/" className="dashboard__nav-brand">TechTies</a>
          <div className="dashboard__nav-actions">
            <a href="/profile/edit" className="button button--ghost button--sm">Edit Profile</a>
            <a href="/dashboard" className="button button--secondary button--sm">Dashboard</a>
          </div>
        </nav>
        <div className="dashboard__container">
          <div className="error-state" style={{ textAlign: "center", padding: "3rem", background: "#fff5f5", color: "#c53030", borderRadius: "8px", border: "1px solid #feb2b2" }}>
            <p style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>{error}</p>
            <button 
              className="primary-btn" 
              onClick={() => alert("Upgrade Membership flow would trigger here. Contact techties support for upgrade info!")}
              style={{ background: "#4CAF50", borderColor: "#4CAF50" }}
            >
              ⭐ Upgrade Membership
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <nav className="dashboard__nav">
        <a href="/" className="dashboard__nav-brand">
          TechTies
        </a>
        <div className="dashboard__nav-actions">
          <a href="/profile/edit" className="button button--ghost button--sm">
            Edit Profile
          </a>
          <a href="/dashboard" className="button button--secondary button--sm">
            Dashboard
          </a>
        </div>
      </nav>

      <div className="dashboard__container">
        <div className="match-recommendations-wrapper">
          <div className="pm-dashboard-header" style={{ marginBottom: "2rem" }}>
            <h2>Your Match Recommendations</h2>
            <p className="subtitle">Based on your skills and preferences</p>
          </div>

          {recommendations.length === 0 ? (
            <div className="no-matches" style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", textAlign: "center" }}>
              <p>We couldn't find any matches right now. Try adding more skills to your profile!</p>
            </div>
          ) : (
            <div className="matches-grid">
              {recommendations.map((match, index) => (
                <div key={index} className="match-card">
                  <div className="match-header">
                    {match.photo ? (
                      <img src={match.photo} alt="Profile" className="match-avatar" />
                    ) : (
                      <div className="match-avatar-placeholder">
                         {match.user?.name ? match.user.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <div>
                      <h3>{match.user?.name || 'Unknown User'}</h3>
                      <div className="match-meta">
                        <span className="match-age">{match.age} years old</span>
                        <span className="match-city">• {match.location}</span>
                      </div>
                      <span className="match-score">Overall Match: {match.matchScore}%</span>
                    </div>
                  </div>
                  
                  <div className="match-body">
                    <div className="score-breakdown">
                      <div className="score-tag">Skills: {match.scoreBreakdown.skills}/40</div>
                      <div className="score-tag">Location: {match.scoreBreakdown.location}/30</div>
                      <div className="score-tag">Type: {match.scoreBreakdown.memberType}/20</div>
                      <div className="score-tag">Age: {match.scoreBreakdown.age}/10</div>
                    </div>

                    {match.bio && <p className="match-bio">"{match.bio}"</p>}
                    
                    <div className="shared-skills">
                      <strong>Shared Skills: </strong>
                      {match.sharedSkills.map((skill, i) => (
                        <span key={i} className="skill-pill">{skill}</span>
                      ))}
                    </div>

                    {match.allowContactShare && (
                      <div className="match-contact">
                        <strong>Contact: </strong>
                        <ContactRevealer userId={match.user._id} />
                      </div>
                    )}
                  </div>
                  
                  <div className="match-actions">
                    <button className="primary-btn" onClick={() => navigate(`/profile/view/${match.user._id}`)}>View Full Profile</button>
                    
                    <div className="feedback-section" style={{ marginTop: "1rem", borderTop: "1px solid #eee", paddingTop: "1rem", textAlign: "center" }}>
                      <span style={{ fontSize: "0.9rem", color: "#666", display: "block", marginBottom: "0.5rem" }}>Rate this match:</span>
                      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                        <button 
                          onClick={async (e) => {
                            e.target.innerText = "Submitting...";
                            e.target.disabled = true;
                            try {
                              await fetch('/api/feedback/submit', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': localStorage.getItem('token')
                                },
                                body: JSON.stringify({ matchedUserId: match.user?._id, score: 5, comments: 'Good match' })
                              });
                              e.target.innerText = "✅ Good";
                            } catch(err) {
                              e.target.innerText = "Error";
                            }
                          }}
                          style={{ padding: "0.4rem 1rem", border: "1px solid #4CAF50", color: "#4CAF50", background: "transparent", borderRadius: "4px", cursor: "pointer" }}>
                          👍 Good
                        </button>
                        <button 
                          onClick={async (e) => {
                            e.target.innerText = "Submitting...";
                            e.target.disabled = true;
                            try {
                              await fetch('/api/feedback/submit', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': localStorage.getItem('token')
                                },
                                body: JSON.stringify({ matchedUserId: match.user?._id, score: 1, comments: 'Poor match' })
                              });
                              e.target.innerText = "✅ Poor";
                            } catch(err) {
                               e.target.innerText = "Error";
                            }
                          }}
                          style={{ padding: "0.4rem 1rem", border: "1px solid #f44336", color: "#f44336", background: "transparent", borderRadius: "4px", cursor: "pointer" }}>
                          👎 Poor
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchRecommendations;
