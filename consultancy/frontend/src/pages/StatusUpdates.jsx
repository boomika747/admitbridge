import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, Clock } from 'lucide-react';

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

const fallbackUpdates = [
  {
    title: "1. Profile Intake & Transcripts Verification",
    desc: "Academic transcripts and standardized test scores officially verified.",
    status: "completed"
  },
  {
    title: "2. SOP & Recommendation Letters Drafting",
    desc: "First iteration of SOP submitted; consultant review and refinement in progress.",
    status: "current"
  },
  {
    title: "3. Direct Portal Application Submission",
    desc: "Formal submission to Stanford University and Carnegie Mellon University admissions portals.",
    status: "pending"
  },
  {
    title: "4. Visa Documentation & I-20 Processing",
    desc: "Preparation of DS-160 financial disclosures and SEVIS fee confirmation.",
    status: "pending"
  }
];

const StatusUpdates = () => {
  const [updates, setUpdates] = useState(fallbackUpdates);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setError(null);
        const response = await authFetch(`${import.meta.env.VITE_API_URL}/status_updates`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setUpdates(data);
          } else {
            setUpdates(fallbackUpdates);
          }
        } else {
          setUpdates(fallbackUpdates);
        }
      } catch (err) {
        console.warn("Backend offline or static mode - showing demo status updates:", err);
        setUpdates(fallbackUpdates);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-icon" style={{ backgroundColor: 'var(--accent-color)' }}>
          <Activity size={24} color="white" />
        </div>
        <div className="page-header-text">
          <h1>Status Updates</h1>
          <p>Track student application workflows and timeline progression.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Workflow Tracker: Sarah Jenkins</h3>
        
        {error && <div className="error-alert" style={{ marginBottom: '16px' }}>{error}</div>}
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Loading workflow tracker...</p>
        ) : updates.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>No active workflows to track.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '15px', top: '20px', bottom: '20px', width: '2px', backgroundColor: 'var(--border-color)', zIndex: 1 }}></div>
            
            {updates.map((su, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 2 }}>
                {su.status === 'completed' && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                    <CheckCircle size={16} />
                  </div>
                )}
                {su.status === 'current' && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, boxShadow: '0 0 0 4px rgba(212, 175, 55, 0.2)' }}>
                    <Clock size={16} />
                  </div>
                )}
                {su.status === 'pending' && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', border: '2px solid var(--border-color)', flexShrink: 0 }}></div>
                )}
                
                {su.status === 'current' ? (
                  <div className="card" style={{ padding: '16px', flex: 1, marginTop: '-8px' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-dark)', marginBottom: '8px' }}>{su.title}</h4>
                    <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '16px' }}>{su.desc}</p>
                    <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Update Progress</button>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ margin: 0, color: su.status === 'pending' ? 'var(--text-light)' : 'var(--text-dark)' }}>{su.title}</h4>
                    <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>{su.desc}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusUpdates;
