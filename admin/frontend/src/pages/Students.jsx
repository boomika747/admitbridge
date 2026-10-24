import React, { useState } from 'react';
import { Users, Search, MoreVertical, CheckCircle, XCircle, Clock, FileQuestion, Filter } from 'lucide-react';
import './Students.css';

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

const fallbackAdminStudents = [
  {
    id: "STU-01",
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    date: "2026-10-12",
    status: "Active",
    applicationStatus: "Accepted"
  },
  {
    id: "STU-02",
    name: "David Chen",
    email: "david.c@example.com",
    date: "2026-10-14",
    status: "Active",
    applicationStatus: "Accepted"
  },
  {
    id: "STU-03",
    name: "Emily Watson",
    email: "emily.w@example.com",
    date: "2026-10-15",
    status: "Active",
    applicationStatus: "Pending"
  },
  {
    id: "STU-04",
    name: "Alex Rivera",
    email: "alex.r@example.com",
    date: "2026-10-16",
    status: "Active",
    applicationStatus: "Accepted"
  },
  {
    id: "STU-05",
    name: "Priya Sharma",
    email: "priya.s@example.com",
    date: "2026-10-18",
    status: "Active",
    applicationStatus: "Accepted"
  }
];

const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [students, setStudents] = useState(fallbackAdminStudents);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('token');
        const res = await authFetch(`${import.meta.env.VITE_API_URL}/admin/students`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setStudents(data.map(u => ({
              id: (u._id || '').substring(18) || `STU-${Math.floor(Math.random()*100)}`,
              name: u.name || (u.email ? u.email.split('@')[0] : 'Student'),
              email: u.email,
              date: u.createdAt || new Date().toISOString().split('T')[0],
              status: 'Active',
              applicationStatus: 'Accepted'
            })));
          } else {
            setStudents(fallbackAdminStudents);
          }
        } else {
          setStudents(fallbackAdminStudents);
        }
      } catch (err) {
        console.warn("Backend offline or static mode - showing demo students:", err);
        setStudents(fallbackAdminStudents);
      }
    };
    fetchStudents();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const toggleStatus = (id) => {
    setStudents(students.map(student => {
      if (student.id === id) {
        return { ...student, status: student.status === 'Active' ? 'Suspended' : 'Active' };
      }
      return student;
    }));
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'All' || student.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const renderAppStatus = (status) => {
    switch(status) {
      case 'Accepted': return <span className="status-badge active"><CheckCircle size={14} /> Accepted</span>;
      case 'Rejected': return <span className="status-badge rejected"><XCircle size={14} /> Rejected</span>;
      case 'Pending': return <span className="status-badge pending"><Clock size={14} /> Pending</span>;
      case 'None': return <span className="status-badge none" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-light)' }}><FileQuestion size={14} /> No Apps</span>;
      default: return null;
    }
  };

  return (
    <div className="module-container fade-in">
      <div className="page-header">
        <div className="page-header-icon">
          <Users size={24} />
        </div>
        <div className="page-header-text">
          <h1>Manage Students</h1>
          <p>View and manage all registered student accounts.</p>
        </div>
      </div>

      {error && <div className="error-alert"><XCircle size={18} /> {error}</div>}

      <div className="card table-card">
        <div className="table-header-actions">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search students by name or email..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="filter-group">
            <Filter size={18} className="text-light" />
            <select value={statusFilter} onChange={handleFilterChange}>
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email Address</th>
                <th>Registration Date</th>
                <th>Account Status</th>
                <th>Application Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td className="font-mono">{student.id}</td>
                    <td className="font-medium">{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.date}</td>
                    <td>
                      <span className={`status-pill ${student.status.toLowerCase()}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      {renderAppStatus(student.applicationStatus)}
                    </td>
                    <td>
                      <button 
                        className={`btn-action ${student.status === 'Active' ? 'btn-danger-text' : 'btn-success-text'}`}
                        onClick={() => toggleStatus(student.id)}
                      >
                        {student.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center empty-table">
                    No students match the search/filter criteria.
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

export default Students;
