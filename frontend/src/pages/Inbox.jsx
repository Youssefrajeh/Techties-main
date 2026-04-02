import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import ContactForm from '../components/ContactForm';
import './Inbox.css';

const Inbox = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReply, setSelectedReply] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/messages/my-messages', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch messages');
        setMessages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="inbox-page">
        <div className="inbox-container loading">
          <div className="spinner"></div>
          <p>Loading your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inbox-page">
      <nav className="dashboard__nav">
        <Link to="/" className="dashboard__nav-brand">TechTies</Link>
        <div className="dashboard__nav-actions">
          <Button variant="ghost" size="sm" to="/dashboard">Dashboard</Button>
          <Button variant="secondary" size="sm" to="/matches">Matches</Button>
        </div>
      </nav>

      <div className="inbox-container">
        <header className="inbox-header">
          <h1>My Inbox</h1>
          <p>You have {messages.length} messages</p>
        </header>

        {error && <div className="inbox-error">{error}</div>}

        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>Your inbox is empty. Start connecting with matches!</p>
              <Button variant="primary" to="/matches">Find Matches</Button>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg._id} className="message-item">
                <div className="message-item__header">
                  <div className="message-item__sender">
                    <span className="sender-label">From:</span> {msg.sender?.name || 'Unknown User'}
                  </div>
                  <div className="message-item__date">
                    {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="message-item__subject">
                  <strong>Subject:</strong> {msg.subject}
                </div>
                <div className="message-item__content">
                  {msg.content}
                </div>
                <div className="message-item__actions">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedReply({ id: msg.sender?._id, name: msg.sender?.name, subject: `Re: ${msg.subject}` })}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedReply && (
        <ContactForm
          recipientId={selectedReply.id}
          recipientName={selectedReply.name}
          onClose={() => setSelectedReply(null)}
        />
      )}
    </div>
  );
};

export default Inbox;
