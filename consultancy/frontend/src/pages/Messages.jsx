import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

const fallbackMessages = [
  {
    id: 1,
    sender_id: 'usr_alex',
    sender_name: 'Alex Johnson',
    text: 'Hello! I have uploaded my updated SOP draft for Stanford. Could you review the research section?',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    is_self: false
  },
  {
    id: 2,
    sender_id: 'usr_consultant',
    sender_name: 'Advisor',
    text: 'Hi Alex, I reviewed it. Your methodology section is very strong. I suggest highlighting your distributed systems project on page 2.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    is_self: true
  },
  {
    id: 3,
    sender_id: 'usr_alex',
    sender_name: 'Alex Johnson',
    text: 'Thank you! I will incorporate that change and upload the revised version this evening.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    is_self: false
  }
];

const Messages = () => {
  const [messages, setMessages] = useState(fallbackMessages);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const response = await authFetch(`${import.meta.env.VITE_API_URL}/messages?sender=usr_consultant&receiver=usr_alex`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const processed = data.map(msg => ({
            ...msg,
            is_self: msg.sender_id === 'usr_consultant'
          }));
          setMessages(processed);
          setError(null);
        }
      }
    } catch (err) {
      console.warn("Backend offline or static mode - showing demo messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!replyText.trim()) return;
    const textToSend = replyText;
    setReplyText('');

    const optimisticMsg = {
      id: Date.now(),
      sender_id: 'usr_consultant',
      sender_name: 'Advisor',
      text: textToSend,
      timestamp: new Date().toISOString(),
      is_self: true
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await authFetch(`${import.meta.env.VITE_API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: 'usr_consultant',
          sender_name: 'Consultant',
          receiver_id: 'usr_alex',
          receiver_name: 'Alex Johnson',
          text: textToSend
        })
      });
    } catch (err) {
      console.warn("Could not sync message to backend (offline mode):", err);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <div className="page-header-icon" style={{ backgroundColor: 'var(--secondary-color)' }}>
          <MessageSquare size={24} color="white" />
        </div>
        <div className="page-header-text">
          <h1>Messages</h1>
          <p>Communicate directly with your assigned students.</p>
        </div>
      </div>

      {error && <div className="error-alert" style={{ marginBottom: '16px' }}>{error}</div>}

      <div className="card" style={{ flex: 1, display: 'flex', padding: 0, overflow: 'hidden' }}>
        <div style={{ width: '300px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
            <input type="text" placeholder="Search chats..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(14, 165, 164, 0.05)', cursor: 'pointer', borderLeft: '3px solid var(--secondary-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-dark)' }}>Alex Johnson</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Active Chat</p>
            </div>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.3s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-color)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-dark)' }}>Maria Garcia</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Offline</p>
            </div>
          </div>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>AJ</div>
            <h3 style={{ margin: 0 }}>Alex Johnson</h3>
          </div>
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <p style={{textAlign: 'center', color: 'var(--text-light)'}}>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p style={{textAlign: 'center', color: 'var(--text-light)'}}>No messages yet.</p>
            ) : (
              messages.map((msg, idx) => {
                let displayTime = 'Just now';
                if (msg.timestamp) {
                    try {
                        const d = new Date(msg.timestamp);
                        if (!isNaN(d)) displayTime = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        else displayTime = msg.timestamp;
                    } catch(e) { displayTime = msg.timestamp; }
                }
                return (
                <div key={idx} style={{ 
                  alignSelf: msg.is_self ? 'flex-end' : 'flex-start', 
                  backgroundColor: msg.is_self ? 'var(--secondary-color)' : 'white', 
                  color: msg.is_self ? 'white' : 'var(--text-dark)',
                  padding: '12px 16px', 
                  borderRadius: '16px', 
                  borderBottomLeftRadius: msg.is_self ? '16px' : '4px',
                  borderBottomRightRadius: msg.is_self ? '4px' : '16px',
                  border: msg.is_self ? 'none' : '1px solid var(--border-color)', 
                  maxWidth: '70%', 
                  boxShadow: msg.is_self ? '0 2px 4px rgba(14,165,164,0.2)' : 'none' 
                }}>
                  <p style={{ margin: 0 }}>{msg.text}</p>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: msg.is_self ? 'rgba(255,255,255,0.8)' : 'var(--text-light)', marginTop: '8px' }}>
                    {displayTime}
                  </span>
                </div>
              )})
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Type your reply..." 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', outline: 'none' }} 
            />
            <button className="btn-primary" onClick={handleSend} style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0 }}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
