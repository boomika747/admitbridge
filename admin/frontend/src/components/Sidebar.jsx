import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Settings, LogOut, ShieldCheck, FileText, Home } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/students', name: 'Manage Students', icon: <Users size={20} /> },
    { path: '/consultancies', name: 'Consultancies', icon: <Building2 size={20} /> },
    { path: '/applications', name: 'Applications', icon: <FileText size={20} /> },
    { path: '/settings', name: 'System Settings', icon: <Settings size={20} /> }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <ShieldCheck size={28} className="logo-icon" />
        <h2>Admin Portal</h2>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-name">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <a href={import.meta.env.VITE_STUDENT_PORTAL_URL || 'http://localhost:5173'} className="nav-item" style={{marginBottom: '10px', textDecoration: 'none'}}>
          <span className="nav-icon"><Home size={20} /></span>
          <span className="nav-name">Back to Home</span>
        </a>
        <button className="logout-btn" onClick={() => window.location.href = `${import.meta.env.VITE_STUDENT_PORTAL_URL || 'http://localhost:5173'}/login`}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
