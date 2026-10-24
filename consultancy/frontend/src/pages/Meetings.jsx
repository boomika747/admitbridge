import React, { useState, useEffect } from 'react';
import { Calendar, Video, Clock } from 'lucide-react';

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

const fallbackMeetings = [
  {
    month: "Oct",
    day: "28",
    title: "1-on-1 SOP Finalization Review",
    time: "10:30 AM EST",
    studentName: "Sarah Jenkins"
  },
  {
    month: "Nov",
    day: "04",
    title: "Visa Mock Interview & Financial Prep",
    time: "02:00 PM EST",
    studentName: "David Chen"
  },
  {
    month: "Nov",
    day: "12",
    title: "University Shortlisting & Scholarship Strategy",
    time: "04:30 PM EST",
    studentName: "Emily Watson"
  }
];

const Meetings = () => {
  const [meetings, setMeetings] = useState(fallbackMeetings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setError(null);
        const response = await authFetch(`${import.meta.env.VITE_API_URL}/meetings`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setMeetings(data);
          } else {
            setMeetings(fallbackMeetings);
          }
        } else {
          setMeetings(fallbackMeetings);
        }
      } catch (err) {
        console.warn("Backend offline or static mode - showing demo meetings:", err);
        setMeetings(fallbackMeetings);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-icon" style={{ backgroundColor: 'var(--primary-color)' }}>
          <Calendar size={24} color="white" />
        </div>
        <div className="page-header-text">
          <h1>Meetings</h1>
          <p>Schedule and manage consultation sessions with your students.</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3>Upcoming Schedule</h3>
          <button className="btn-primary">Schedule New Meeting</button>
        </div>

        {error && <div className="error-alert" style={{ marginBottom: '16px' }}>{error}</div>}

        <div style={{ display: 'grid', gap: '16px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Loading upcoming meetings...</p>
          ) : meetings.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>No upcoming meetings.</p>
          ) : (
            meetings.map((mtg, idx) => (
              <div key={idx} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '24px', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(14, 165, 164, 0.1)', borderRadius: '12px', minWidth: '80px' }}>
                  <strong style={{ display: 'block', color: 'var(--secondary-color)', fontSize: '1.2rem' }}>{mtg.month}</strong>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>{mtg.day}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-dark)' }}>{mtg.title}</h4>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)', marginBottom: '4px', fontSize: '0.9rem' }}>
                    <Clock size={16} /> {mtg.time}
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                    Student: <strong>{mtg.studentName}</strong>
                  </p>
                </div>
                <button className="btn-secondary" style={{ backgroundColor: 'var(--secondary-color)', color: 'white', borderColor: 'var(--secondary-color)' }}>
                  <Video size={18} /> Join Call
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Meetings;
