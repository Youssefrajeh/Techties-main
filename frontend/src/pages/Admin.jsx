import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getSession, logout } from '../utils/auth';
import './Admin.css';

function getToken() {
  return localStorage.getItem('token');
}

function api(path, options = {}) {
  const token = getToken();
  return fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
}

export default function Admin() {
  const navigate = useNavigate();
  const session = getSession();

  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState('');
  const [banner, setBanner] = useState({ type: '', text: '' });

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('member');
  const [editPaid, setEditPaid] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  // filters / search
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [paidFilter, setPaidFilter] = useState('all');

  // auth check
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    api('/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.role !== 'pm') {
          navigate('/dashboard', { state: { adminDenied: true }, replace: true });
          return;
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Session invalid. Please log in again.');
        setLoading(false);
      });
  }, [navigate]);

  const loadStats = async () => {
    try {
      const res = await api('/admin/dashboard');
      const data = await res.json();
      if (res.ok && data.metrics) {
        setStats(data.metrics);
      }
    } catch {
      // silent
    }
  };

  const loadUsers = async () => {
    setTabLoading(true);
    try {
      const res = await api('/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(Array.isArray(data) ? data : []);
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    } finally {
      setTabLoading(false);
    }
  };

  const loadProfiles = async () => {
    setTabLoading(true);
    try {
      const res = await api('/admin/profiles');
      const data = await res.json();
      if (res.ok) {
        setProfiles(Array.isArray(data) ? data : []);
      } else {
        setProfiles([]);
      }
    } catch {
      setProfiles([]);
    } finally {
      setTabLoading(false);
    }
  };

  const loadFeedback = async () => {
    setTabLoading(true);
    try {
      const res = await api('/admin/feedback');
      const data = await res.json();
      if (res.ok) {
        setFeedback(Array.isArray(data) ? data : []);
      } else {
        setFeedback([]);
      }
    } catch {
      setFeedback([]);
    } finally {
      setTabLoading(false);
    }
  };

  useEffect(() => {
    if (loading || error) return;

    if (activeTab === 'Overview') loadStats();
    if (activeTab === 'Users') loadUsers();
    if (activeTab === 'Profiles') loadProfiles();
    if (activeTab === 'Feedback') loadFeedback();
  }, [loading, error, activeTab]);

  const refreshActiveTab = async () => {
    setBanner({ type: '', text: '' });

    if (activeTab === 'Overview') {
      await loadStats();
      setBanner({ type: 'success', text: 'Overview refreshed.' });
    }

    if (activeTab === 'Users') {
      await loadUsers();
      await loadStats();
      setBanner({ type: 'success', text: 'Users refreshed.' });
    }

    if (activeTab === 'Profiles') {
      await loadProfiles();
      setBanner({ type: 'success', text: 'Profiles refreshed.' });
    }

    if (activeTab === 'Feedback') {
      await loadFeedback();
      setBanner({ type: 'success', text: 'Feedback refreshed.' });
    }
  };

  const startEdit = (u) => {
    setEditingUser(u._id);
    setEditRole(u.role || 'member');
    setEditPaid(!!u.isPaid);
    setBanner({ type: '', text: '' });
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  const handleUpdateUser = async (userId) => {
    setSaving(true);
    setBanner({ type: '', text: '' });

    try {
      const res = await api(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: editRole, isPaid: editPaid }),
      });

      const data = await res.json();

      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u._id === userId ? data : u)));
        setEditingUser(null);
        setBanner({ type: 'success', text: 'User updated successfully.' });
        loadStats();
      } else {
        setBanner({ type: 'error', text: data.msg || 'Update failed.' });
      }
    } catch {
      setBanner({ type: 'error', text: 'Request failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt("Enter a new temporary password for this user (min 8 chars):");
    if (!newPassword) return;
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);
      const res = await api(`/admin/users/${userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      });
      if (res.ok) {
        alert("Password reset successfully!");
      } else {
        const data = await res.json();
        alert(`Error: ${data.msg || "Failed to reset password"}`);
      }
    } catch {
      alert("Network error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name || user.email}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingUserId(user._id);
    setBanner({ type: '', text: '' });

    try {
      const res = await api(`/admin/users/${user._id}`, {
        method: 'DELETE',
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
        setProfiles((prev) => prev.filter((p) => p.user?._id !== user._id));
        setFeedback((prev) =>
          prev.filter(
            (f) => f.user?._id !== user._id && f.matchedUser?._id !== user._id
          )
        );
        setBanner({ type: 'success', text: 'User deleted successfully.' });
        loadStats();
      } else {
        setBanner({ type: 'error', text: data.msg || 'Delete failed.' });
      }
    } catch {
      setBanner({ type: 'error', text: 'Delete request failed.' });
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !userSearch.trim() ||
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase());

      const matchesRole =
        roleFilter === 'all' ? true : (u.role || 'member') === roleFilter;

      const matchesPaid =
        paidFilter === 'all'
          ? true
          : paidFilter === 'paid'
          ? !!u.isPaid
          : !u.isPaid;

      return matchesSearch && matchesRole && matchesPaid;
    });
  }, [users, userSearch, roleFilter, paidFilter]);

  const tabCounts = {
    Users: users.length,
    Profiles: profiles.length,
    Feedback: feedback.length,
  };

  if (loading) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <Link to="/" className="admin-logo">TechTies</Link>
          <nav className="admin-nav">
            <Link to="/dashboard">Dashboard</Link>
          </nav>
        </header>
        <div className="admin-container">
          <div className="admin-loading">Checking access...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <Link to="/" className="admin-logo">TechTies</Link>
        </header>
        <div className="admin-container">
          <div className="admin-error">{error}</div>
          <Link to="/login" className="admin-btn admin-btn--primary">Log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <Link to="/" className="admin-logo">TechTies Admin</Link>
        <nav className="admin-nav">
          <Link to="/">Home</Link>
          <span className="admin-user">{session?.email}</span>
          <button
            type="button"
            className="admin-btn admin-btn--sm admin-btn--outline admin-btn--logout"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Log out
          </button>
        </nav>
      </header>

      <div className="admin-tabs">
        {['Overview', 'Users', 'Profiles', 'Feedback'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`admin-tab ${activeTab === tab ? 'admin-tab--active' : ''}`}
            onClick={() => {
              setActiveTab(tab);
              setBanner({ type: '', text: '' });
            }}
          >
            {tab}
            {tabCounts[tab] !== undefined ? ` (${tabCounts[tab]})` : ''}
          </button>
        ))}
      </div>

      <div className="admin-container">
        {banner.text && (
          <div
            className={
              banner.type === 'error'
                ? 'admin-banner admin-banner--error'
                : 'admin-banner admin-banner--success'
            }
          >
            {banner.text}
          </div>
        )}

        <div className="admin-toolbar">
          <button
            type="button"
            className="admin-btn admin-btn--sm admin-btn--outline"
            onClick={refreshActiveTab}
          >
            Refresh
          </button>
        </div>

        {activeTab === 'Overview' && (
          <section className="admin-section">
            <h2 className="admin-section-title">Platform Performance Metrics</h2>
            {stats ? (
              <div className="admin-stats">
                <div className="admin-stat-card">
                  <span className="admin-stat-label">Free members</span>
                  <span className="admin-stat-value">{stats.totalFreeMembers ?? 0}</span>
                </div>

                <div className="admin-stat-card admin-stat-card--admin">
                  <span className="admin-stat-label">Paid members</span>
                  <span className="admin-stat-value">{stats.totalPaidMembers ?? 0}</span>
                </div>

                <div className="admin-stat-card admin-stat-card--highlight">
                  <span className="admin-stat-label">Exposed Contact Info</span>
                  <span className="admin-stat-value">{stats.totalExposedMatches ?? 0}</span>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#64748b' }}>
                    Number of matches where communication info was revealed
                  </p>
                </div>

                <div className="admin-stat-card">
                  <span className="admin-stat-label">Total Matches to Date</span>
                  <span className="admin-stat-value">{stats.totalMatchesToDate ?? 0}</span>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#64748b' }}>
                    Total user feedbacks/ratings submitted
                  </p>
                </div>
              </div>
            ) : (
              <p className="admin-muted">Loading metrics…</p>
            )}
          </section>
        )}

        {activeTab === 'Users' && (
          <section className="admin-section">
            <div className="admin-section-head">
              <h2 className="admin-section-title">Users</h2>
            </div>

            <div className="admin-filters">
              <input
                type="text"
                className="admin-input"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />

              <select
                className="admin-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All roles</option>
                <option value="member">member</option>
                <option value="pm">pm</option>
              </select>

              <select
                className="admin-select"
                value={paidFilter}
                onChange={(e) => setPaidFilter(e.target.value)}
              >
                <option value="all">All payment statuses</option>
                <option value="paid">Paid only</option>
                <option value="unpaid">Unpaid only</option>
              </select>
            </div>

            {tabLoading ? (
              <p className="admin-muted">Loading users…</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Paid</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name || '—'}</td>
                        <td>{u.email}</td>
                        <td>
                          {editingUser === u._id ? (
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              disabled={saving}
                              className="admin-select"
                            >
                              <option value="member">member</option>
                              <option value="pm">pm</option>
                            </select>
                          ) : (
                            u.role || 'member'
                          )}
                        </td>

                        <td>
                          {editingUser === u._id ? (
                            <label className="admin-check">
                              <input
                                type="checkbox"
                                checked={editPaid}
                                onChange={(e) => setEditPaid(e.target.checked)}
                                disabled={saving}
                              />
                              Paid
                            </label>
                          ) : (
                            u.isPaid ? 'Yes' : 'No'
                          )}
                        </td>

                        <td>{u.date ? new Date(u.date).toLocaleDateString() : '—'}</td>

                        <td>
                          <div className="admin-actions">
                            {editingUser === u._id ? (
                              <>
                                <button
                                  type="button"
                                  className="admin-btn admin-btn--sm"
                                  onClick={() => handleUpdateUser(u._id)}
                                  disabled={saving}
                                >
                                  {saving ? 'Saving…' : 'Save'}
                                </button>

                                <button
                                  type="button"
                                  className="admin-btn admin-btn--sm admin-btn--outline"
                                  onClick={cancelEdit}
                                  disabled={saving}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="admin-btn admin-btn--sm admin-btn--outline"
                                  onClick={() => startEdit(u)}
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="admin-btn admin-btn--sm admin-btn--outline"
                                  onClick={() => handleResetPassword(u._id)}
                                  style={{ color: '#d97706', borderColor: '#fcd34b' }}
                                >
                                  Reset Pass
                                </button>

                                <button
                                  type="button"
                                  className="admin-btn admin-btn--sm admin-btn--danger"
                                  onClick={() => handleDeleteUser(u)}
                                  disabled={deletingUserId === u._id}
                                >
                                  {deletingUserId === u._id ? 'Deleting…' : 'Delete'}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!tabLoading && filteredUsers.length === 0 && (
              <p className="admin-muted">No users found.</p>
            )}
          </section>
        )}

        {activeTab === 'Profiles' && (
          <section className="admin-section">
            <h2 className="admin-section-title">Profiles</h2>

            {tabLoading ? (
              <p className="admin-muted">Loading profiles…</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Bio</th>
                      <th>Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p._id}>
                        <td>{p.user?.name || '—'}</td>
                        <td>{p.user?.email || '—'}</td>
                        <td className="admin-cell-truncate">
                          {(p.bio || '').slice(0, 60)}
                          {(p.bio || '').length > 60 ? '…' : ''}
                        </td>
                        <td>{(p.skills || []).join(', ') || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!tabLoading && profiles.length === 0 && (
              <p className="admin-muted">No profiles.</p>
            )}
          </section>
        )}

        {activeTab === 'Feedback' && (
          <section className="admin-section">
            <h2 className="admin-section-title">Match feedback</h2>

            {tabLoading ? (
              <p className="admin-muted">Loading feedback…</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>From</th>
                      <th>To</th>
                      <th>Score</th>
                      <th>Comments</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedback.map((f) => (
                      <tr key={f._id}>
                        <td>{f.user?.name || f.user?.email || '—'}</td>
                        <td>{f.matchedUser?.name || f.matchedUser?.email || '—'}</td>
                        <td>{f.score}/5</td>
                        <td className="admin-cell-truncate">
                          {(f.comments || '').slice(0, 40)}
                          {(f.comments || '').length > 40 ? '…' : ''}
                        </td>
                        <td>{f.date ? new Date(f.date).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!tabLoading && feedback.length === 0 && (
              <p className="admin-muted">No feedback yet.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}