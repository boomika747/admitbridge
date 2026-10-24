import React, { useState, useEffect } from 'react';
import { FileCheck, Edit, MessageSquare } from 'lucide-react';

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

const fallbackApplications = [
  { _id: 'app_1', name: 'Sarah Jenkins', unis: 'Stanford University', country: 'USA', status: 'Under Review' },
  { _id: 'app_2', name: 'David Chen', unis: 'Technical University of Munich', country: 'Germany', status: 'Under Review' },
  { _id: 'app_3', name: 'Emily Watson', unis: 'University of Oxford', country: 'UK', status: 'Pending' },
  { _id: 'app_4', name: 'Alex Rivera', unis: 'University of Toronto', country: 'Canada', status: 'Under Review' },
  { _id: 'app_5', name: 'Priya Sharma', unis: 'University of Melbourne', country: 'Australia', status: 'Pending' }
];

const Applications = () => {
  const [applications, setApplications] = useState(fallbackApplications);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('token');
        const res = await authFetch(`${import.meta.env.VITE_API_URL}/applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setApplications(data);
          } else {
            setApplications(fallbackApplications);
          }
        } else {
          setApplications(fallbackApplications);
        }
      } catch (err) {
        console.warn("Backend offline or static mode - showing demo applications:", err);
        setApplications(fallbackApplications);
      }
    };
    
    fetchApplications();
    const interval = setInterval(fetchApplications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleResubmit = async (appToUpdate) => {
    // Update local state immediately for instant feedback
    setApplications(prev => prev.map(a => a._id === appToUpdate._id ? { ...a, status: 'Under Review' } : a));

    // Sync with backend if available
    try {
      setError(null);
      const token = localStorage.getItem('token');
      await authFetch(`${import.meta.env.VITE_API_URL}/students/applications/${appToUpdate._id || 'unknown'}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: 'Under Review' })
      });
    } catch (err) {
      console.warn("Could not sync status update to backend (offline mode):", err);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-icon">
          <FileCheck size={24} />
        </div>
        <div className="page-header-text">
          <h1>Application Reviews</h1>
          <p>Review submitted documents and finalize university applications.</p>
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-light)', textAlign: 'left' }}>
              <th style={{ padding: '16px' }}>Student Name</th>
              <th style={{ padding: '16px' }}>University</th>
              <th style={{ padding: '16px' }}>Country</th>
              <th style={{ padding: '16px' }}>Last Updated</th>
              <th style={{ padding: '16px' }}>Status</th>
              <th style={{ padding: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.filter(app => !['Accepted', 'Rejected'].includes(app.status)).length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-light)' }}>
                  No applications currently under review.
                </td>
              </tr>
            ) : (
              applications.filter(app => !['Accepted', 'Rejected'].includes(app.status)).map((app, index) => (
                <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.3s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-color)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{app.name}</td>
                  <td style={{ padding: '16px' }}>{app.unis || 'Pending Selection'}</td>
                  <td style={{ padding: '16px' }}>{app.country}</td>
                  <td style={{ padding: '16px', color: 'var(--text-light)' }}>{new Date().toLocaleDateString()}</td>
                  <td style={{ padding: '16px' }}>
                    <span 
                      className={`badge ${app.status === 'Accepted' || app.status === 'Approved' ? 'badge-approved' : app.status === 'Rejected' ? 'badge-rejected' : app.status === 'Pending' ? 'badge-pending' : 'badge-review'}`}
                      style={app.status === 'Rejected' ? { backgroundColor: '#fef2f2', color: '#ef4444' } : {}}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                    {app.status === 'Pending' ? (
                      <button 
                        className="btn-primary" 
                        onClick={(e) => { e.stopPropagation(); handleResubmit(app); }} 
                        style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--primary-color)' }}
                      >
                        <FileCheck size={14}/> Student Submitted Details (Re-review)
                      </button>
                    ) : (
                      <>
                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Edit size={14}/> Update Status</button>
                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={14}/> Contact</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Applications;
