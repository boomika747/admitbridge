import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Applications.css';

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setError(null);
        const response = await authFetch(`${import.meta.env.VITE_API_URL}/applications`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const formattedApps = data.map((app, index) => ({
              id: `APP-00${index + 1}`,
              name: app.name,
              message: app.message,
              university: app.unis || 'Pending Selection',
              country: app.country,
              consultancy: app.consultancyName || 'Assigned Consultancy',
              date: new Date().toLocaleDateString(),
              status: app.status || 'New Lead'
            }));
            setApplications(formattedApps);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend offline or static mode - showing demo applications:", err);
      }
      
      // Fallback data
      setApplications([
        {
          id: "APP-001",
          university: "Stanford University",
          country: "USA",
          consultancy: "Global Ed Advisors",
          date: "Oct 12, 2026",
          status: "Under Review"
        },
        {
          id: "APP-002",
          university: "University of Oxford",
          country: "UK",
          consultancy: "EduBridge UK",
          date: "Sep 28, 2026",
          status: "Approved"
        },
        {
          id: "APP-003",
          university: "Technical University of Munich",
          country: "Germany",
          consultancy: "German Scholars prep",
          date: "Nov 02, 2026",
          status: "Pending"
        }
      ]);
      setLoading(false);
    };

    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted': return <span className="badge badge-submitted">Submitted</span>;
      case 'Under Review': return <span className="badge badge-review">Under Review</span>;
      case 'Approved': 
      case 'Accepted':
        return <span className="badge badge-approved">{status}</span>;
      case 'Rejected': return <span className="badge badge-rejected">Rejected</span>;
      default: return <span className="badge">{status || 'Unknown'}</span>;
    }
  };

  return (
    <div className="applications fade-in">
      <div className="page-header">
        <h1>My Applications</h1>
        <p>Track the status of your university applications.</p>
      </div>
      {error && <div className="error-alert">{error}</div>}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>Loading your applications...</div>
      ) : (
        <div className="applications-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {applications.map((app) => (
            <div key={app.id} className="card app-card">
              <div className="app-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span className="app-id" style={{ fontWeight: 'bold', color: 'var(--text-light)' }}>{app.id}</span>
                {getStatusBadge(app.status)}
              </div>
              <div className="app-body">
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{app.university}</h3>
                <p><strong>Country:</strong> {app.country}</p>
                <p><strong>Consultancy:</strong> {app.consultancy}</p>
                <p><strong>Date:</strong> {app.date}</p>
              </div>
              <div className="app-footer" style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                <button 
                  className="btn-secondary" 
                  style={{ width: '100%' }}
                  onClick={() => navigate('/status')}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
