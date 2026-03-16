import React, { useState, useEffect } from 'react';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': token,
          },
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.msg || 'You do not have permission to view the PM Dashboard.');
        }

        setStats(data.metrics);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
          <div className="loading-state" style={{ textAlign: "center", padding: "4rem" }}>Loading dashboard analytics...</div>
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
            {error}
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
        <div className="pm-dashboard-container">
          <div className="pm-dashboard-header">
            <h2>Product Manager Dashboard</h2>
            <p className="subtitle">Platform Analytics & Insights</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Active Profiles</div>
              <div className="stat-value">{stats.totalProfiles}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Paid Members</div>
              <div className="stat-value">{stats.totalPaidMembers}</div>
              <div className="stat-trend">
                {stats.totalUsers > 0 ? Math.round((stats.totalPaidMembers / stats.totalUsers) * 100) : 0}% Conversion
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Match Ratings Submissions</div>
              <div className="stat-value">{stats.totalFeedback}</div>
            </div>

            <div className="stat-card highlight-card">
              <div className="stat-label">Avg Match Satisfaction</div>
              <div className="stat-value">
                {stats.averageMatchScore > 0 ? `${stats.averageMatchScore} / 5` : 'No Data'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
