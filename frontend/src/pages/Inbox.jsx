import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getSession } from '../utils/auth';
import './Inbox.css';

export default function Inbox() {
  const [activeTab, setActiveTab] = useState('received');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const navigate = useNavigate();
  
  const session = useMemo(() => getSession(), []);

  const fetchMessages = async (tab) => {
    setLoading(true);
    setMessages([]);
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const endpoint = tab === 'received' ? '/api/messages/inbox' : '/api/messages/sent';
      const res = await fetch(endpoint, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    fetchMessages(activeTab);
  }, [activeTab, session, navigate]);

  const handleOpenMessage = async (msg) => {
    setSelectedMessage(msg);
    if (activeTab === 'received' && !msg.isRead) {
      const token = localStorage.getItem('token');
      try {
        await fetch(`/api/messages/read/${msg._id}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
      } catch (err) {
        console.error('Mark read error:', err);
      }
    }
  };

  const handleDeleteMessage = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m._id !== id));
        if (selectedMessage?._id === id) setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete message');
    }
  };

  const handleClearAll = async () => {
    const folder = activeTab === 'received' ? 'inbox' : 'sent';
    if (!window.confirm(`Are you sure you want to clear your entire ${folder}? This cannot be undone.`)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/messages/clear/${folder}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages([]);
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Clear all error:', err);
      alert('Failed to clear messages');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Yesterday';
    if (days < 7) return date.toLocaleDateString([], { weekday: 'long' });
    return date.toLocaleDateString();
  };

  return (
    <div className="inbox-container">
      <div className="inbox-card">
        <header className="inbox-header">
          <div className="header-left">
            <h1 className="inbox-title">Messages</h1>
            <p className="inbox-subtitle">Manage your platform conversations</p>
          </div>
          <div className="header-actions">
            <Link to="/dashboard" className="admin-btn admin-btn--sm admin-btn--outline">Back to Dashboard</Link>
          </div>
        </header>

        <nav className="inbox-tabs">
          <div className="tabs-list">
            <button 
              className={`inbox-tab ${activeTab === 'received' ? 'active' : ''}`}
              onClick={() => setActiveTab('received')}
            >
              Received
            </button>
            <button 
              className={`inbox-tab ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              Sent
            </button>
          </div>
          {!loading && messages.length > 0 && (
            <button className="clear-all-btn" onClick={handleClearAll}>
              🧹 Clear All
            </button>
          )}
        </nav>

        <div className="message-list">
          {loading ? (
            <div className="empty-inbox">
              <div className="loading-spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-inbox">
              <span className="empty-icon">📂</span>
              <p>No messages in your {activeTab} folder.</p>
            </div>
          ) : (
            <div className="messages-grid-table">
              {messages.map((msg) => (
                <div 
                  key={msg._id} 
                  className={`message-item ${activeTab === 'received' && !msg.isRead ? 'unread' : ''}`}
                  onClick={() => handleOpenMessage(msg)}
                >
                  <div className="msg-icon">
                    {msg.isRead ? '✉️' : '📩'}
                  </div>
                  <div className="msg-main">
                    <div className="sender-name">
                      {activeTab === 'received' ? msg.sender?.name || 'User' : `To: ${msg.recipient?.name || 'User'}`}
                    </div>
                    <div className="message-subject">
                      {msg.subject}
                    </div>
                  </div>
                  <div className="msg-meta">
                    <div className="message-date">
                      {formatDate(msg.createdAt)}
                    </div>
                    <button 
                      className="delete-msg-btn"
                      onClick={(e) => handleDeleteMessage(e, msg._id)}
                      title="Delete message"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedMessage && (
        <div className="message-modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="message-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-top">
                <h2 className="modal-subject">{selectedMessage.subject}</h2>
                <button className="modal-close" onClick={() => setSelectedMessage(null)}>&times;</button>
              </div>
              <div className="modal-meta">
                <div className="meta-info">
                  <strong>{activeTab === 'received' ? 'From' : 'To'}:</strong> {activeTab === 'received' 
                    ? `${selectedMessage.sender?.name} <${selectedMessage.sender?.email}>`
                    : `${selectedMessage.recipient?.name} <${selectedMessage.recipient?.email}>`
                  }
                </div>
                <div className="meta-date">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="modal-body">
              {selectedMessage.content}
            </div>
            <div className="modal-footer">
              <button 
                className="delete-msg-btn-large" 
                onClick={(e) => {
                  handleDeleteMessage(e, selectedMessage._id);
                  setSelectedMessage(null);
                }}
              >
                🗑️ Delete Conversation
              </button>
              <button 
                className="admin-btn admin-btn--primary" 
                onClick={() => setSelectedMessage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
