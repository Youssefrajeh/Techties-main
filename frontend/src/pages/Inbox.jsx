import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getSession } from '../utils/auth';
import './Inbox.css';

export default function Inbox() {
  const [activeTab, setActiveTab] = useState('received');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const navigate = useNavigate();
  const session = getSession();

  const fetchMessages = async (tab) => {
    setLoading(true);
    setMessages([]);
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found');
      setLoading(false);
      return;
    }

    try {
      const endpoint = tab === 'received' ? '/api/messages/inbox' : '/api/messages/sent';
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (res.ok && Array.isArray(data)) {
        setMessages(data);
      } else {
        console.warn('Invalid message data received:', data);
        setMessages([]);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
      setMessages([]);
    } finally {
      // Small delay for smooth transition
      setTimeout(() => setLoading(false), 300);
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
      // Mark as read
      const token = localStorage.getItem('token');
      try {
        await fetch(`/api/messages/read/${msg._id}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });
        // Update local state
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
      } catch (err) {
        console.error('Mark read error:', err);
      }
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
          <h1 className="inbox-title">Messages</h1>
          <Link to="/dashboard" className="admin-btn admin-btn--sm admin-btn--outline">Back to Dashboard</Link>
        </header>

        <nav className="inbox-tabs">
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
        </nav>

        <div className="message-list">
          {loading ? (
            <div className="empty-inbox">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="empty-inbox">
              <span className="empty-icon">📂</span>
              <p>No messages in your {activeTab} folder.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg._id} 
                className={`message-item ${activeTab === 'received' && !msg.isRead ? 'unread' : ''}`}
                onClick={() => handleOpenMessage(msg)}
              >
                <div className="sender-name">
                  {activeTab === 'received' ? msg.sender?.name || 'User' : `To: ${msg.recipient?.name || 'User'}`}
                </div>
                <div className="message-subject">
                  {msg.subject}
                </div>
                <div className="message-date">
                  {formatDate(msg.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedMessage && (
        <div className="message-modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="message-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-subject">{selectedMessage.subject}</h2>
              <div className="modal-meta">
                {activeTab === 'received' 
                  ? `From: ${selectedMessage.sender?.name} (${selectedMessage.sender?.email})`
                  : `To: ${selectedMessage.recipient?.name} (${selectedMessage.recipient?.email})`
                }
                <br />
                {new Date(selectedMessage.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="modal-body">
              {selectedMessage.content}
            </div>
            <div className="modal-footer">
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
