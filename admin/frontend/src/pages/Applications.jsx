import React, { useState } from 'react';
import { FileText, Search, MoreVertical, CheckCircle, Clock, XCircle, Filter } from 'lucide-react';
import './Applications.css';

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

const fallbackAdminApplications = [
  {
    id: "APP-01",
    student: "Sarah Jenkins",
    consultancy: "Global Ed Advisors",
    date: "2026-10-18",
    status: "Under Review"
  },
  {
    id: "APP-02",
    student: "David Chen",
    consultancy: "German Scholars prep",
    date: "2026-10-19",
    status: "Accepted"
  },
  {
    id: "APP-03",
    student: "Emily Watson",
    consultancy: "EduBridge UK",
    date: "2026-10-20",
    status: "Pending"
  },
  {
    id: "APP-04",
    student: "Alex Rivera",
    consultancy: "Global Ed Advisors",
    date: "2026-10-21",
    status: "Under Review"
  },
  {
    id: "APP-05",
    student: "Priya Sharma",
    consultancy: "Leap Scholar Partners",
    date: "2026-10-22",
    status: "Accepted"
  }
];

const Applications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [applications, setApplications] = useState(fallbackAdminApplications);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const fetchApps = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('token');
        const res = await authFetch(`${import.meta.env.VITE_API_URL}/admin/applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setApplications(data.map(app => ({
              id: (app._id || '').substring(18) || `APP-${Math.floor(Math.random()*100)}`,
              student: app.studentName || 'Unknown Student',
              consultancy: app.consultancyName || 'Partner Consultancy',
              date: app.appliedAt || new Date().toISOString().split('T')[0],
              status: app.status || 'Under Review'
            })));
          } else {
            setApplications(fallbackAdminApplications);
          }
        } else {
          setApplications(fallbackAdminApplications);
        }
      } catch (err) {
        console.warn("Backend offline or static mode - showing demo applications:", err);
        setApplications(fallbackAdminApplications);
      }
    };
    fetchApps();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const updateStatus = (id, newStatus) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.student.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.consultancy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const renderStatusIcon = (status) => {
    switch(status) {
      case 'Accepted': return <CheckCircle size={14} />;
      case 'Pending': return <Clock size={14} />;
      case 'Rejected': return <XCircle size={14} />;
      default: return null;
    }
  };

  return (
    <div className="module-container fade-in">
      <div className="page-header">
        <div className="page-header-icon">
          <FileText size={24} />
        </div>
        <div className="page-header-text">
          <h1>System Applications</h1>
          <p>Monitor all student applications across partner consultancies.</p>
        </div>
      </div>

      {error && <div className="error-alert"><XCircle size={18} /> {error}</div>}

      <div className="card table-card">
        <div className="table-header-actions">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by student, consultancy, or ID..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="filter-actions">
            <div className="select-wrapper">
              <Filter size={16} className="select-icon" />
              <select value={statusFilter} onChange={handleFilterChange}>
                <option value="All">All Statuses</option>
                <option value="Accepted">Accepted</option>
                <option value="Under Review">Under Review</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>App ID</th>
                <th>Student</th>
                <th>Consultancy</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length > 0 ? (
                filteredApplications.map(app => (
                  <tr key={app.id}>
                    <td className="font-mono">{app.id}</td>
                    <td className="font-medium">{app.student}</td>
                    <td>{app.consultancy}</td>
                    <td>{app.date}</td>
                    <td>
                      <span className={`status-badge status-${app.status.toLowerCase().replace(' ', '-')}`}>
                        {renderStatusIcon(app.status)}
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon" 
                          title="Accept" 
                          onClick={() => updateStatus(app.id, 'Accepted')}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          className="btn-icon danger" 
                          title="Reject" 
                          onClick={() => updateStatus(app.id, 'Rejected')}
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center empty-table">
                    No applications match the search/filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Applications;
