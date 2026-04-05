import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MatchRecommendations.css';

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
