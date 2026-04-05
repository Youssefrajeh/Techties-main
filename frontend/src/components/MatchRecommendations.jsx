import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MatchRecommendations.css';

const MatchRecommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch match recommendations
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

  const handleRate = async (matchedUserId, score) => {
    try {
      // Optimistically update local state
      setRecommendations(prev => prev.map(match => {
        if (match.user?._id === matchedUserId) {
          return { ...match, existingRating: score, isSubmitting: true };
        }
        return match;
      }));

      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ 
          matchedUserId, 
          score, 
          comments: score === 5 ? 'Liked' : 'Skipped' 
        })
      });

      if (!res.ok) throw new Error('Failed to submit feedback');

      // Update state to remove submitting flag
      setRecommendations(prev => prev.map(match => {
        if (match.user?._id === matchedUserId) {
          return { ...match, isSubmitting: false };
        }
        return match;
      }));

    } catch (err) {
      console.error(err);
      alert('Error submitting feedback. Please try again.');
      // Revert optimistic update (simplified: just remove submitting flag)
      setRecommendations(prev => prev.map(match => {
        if (match.user?._id === matchedUserId) {
          return { ...match, isSubmitting: false };
        }
        return match;
      }));
    }
  };

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
          <div className="admin-dashboard-header" style={{ marginBottom: "2rem" }}>
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
                  </div>
                  
                  <div className="match-actions">
                    <button className="primary-btn" onClick={() => navigate(`/profile/view/${match.user._id}`)}>View Full Profile</button>
                    
                    <div className="feedback-section">
                      {match.existingRating ? (
                        <div className="feedback-result" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span className="feedback-label">Rating submitted:</span>
                          <div className={`feedback-btn selected ${match.existingRating === 5 ? 'btn-good' : 'btn-poor'}`} style={{ cursor: 'default', margin: '0 auto' }}>
                            {match.existingRating === 5 ? '❤️ Liked' : '⏭️ Skipped'}
                          </div>
                          <button 
                            onClick={() => {
                              setRecommendations(prev => prev.map(m => {
                                if (m.user?._id === match.user._id) {
                                  return { ...m, existingRating: null };
                                }
                                return m;
                              }));
                            }} 
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#3498db', 
                              fontSize: '0.8rem', 
                              marginTop: '0.5rem', 
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            Change rating
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="feedback-label">Your decision:</span>
                          <div className="feedback-buttons">
                            <button 
                              onClick={() => handleRate(match.user?._id, 5)}
                              disabled={match.isSubmitting}
                              className="feedback-btn btn-good"
                            >
                              {match.isSubmitting ? '...' : '❤️ Like'}
                            </button>
                            <button 
                              onClick={() => handleRate(match.user?._id, 1)}
                              disabled={match.isSubmitting}
                              className="feedback-btn btn-poor"
                            >
                              {match.isSubmitting ? '...' : '⏭️ Skip'}
                            </button>
                          </div>
                        </>
                      )}
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
