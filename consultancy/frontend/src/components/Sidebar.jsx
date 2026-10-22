import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileCheck, Activity, Calendar, MessageSquare, Settings, LogOut, Home } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/assigned-students', name: 'Assigned Students', icon: <Users size={20} /> },
    { path: '/applications', name: 'Reviews', icon: <FileCheck size={20} /> },
    { path: '/status-updates', name: 'Status Updates', icon: <Activity size={20} /> },
    { path: '/meetings', name: 'Meetings', icon: <Calendar size={20} /> },
    { path: '/messages', name: 'Messages', icon: <MessageSquare size={20} /> },
    { path: '/settings', name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        {(() => {
          const studentPortalUrl = import.meta.env.VITE_STUDENT_PORTAL_URL || (import.meta.env.PROD ? '/admitbridge/' : 'http://localhost:5173');
          const loginUrl = `${studentPortalUrl.replace(/\/$/, '')}/login`;
          return (
            <>
              <a href={studentPortalUrl} className="nav-link" style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--text-light)', textDecoration: 'none'}}>
                <Home size={20} />
                <span>Back to Home</span>
              </a>
              <button className="logout-btn" onClick={() => window.location.href = loginUrl}>
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          );
        })()}
      </div>
    </aside>
  );
};

export default Sidebar;
