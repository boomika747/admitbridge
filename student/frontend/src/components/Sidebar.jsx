import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  GraduationCap, 
  FileText, 
  CreditCard, 
  Activity, 
  Settings,
  Search,
  Compass,
  MessageSquare
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/explore', name: 'Explore Roadmap', icon: <Compass size={20} /> },
    { path: '/colleges', name: 'University Directory', icon: <GraduationCap size={20} /> },
    { path: '/applications', name: 'Applications', icon: <FileText size={20} /> },
    { path: '/payments', name: 'Payments', icon: <CreditCard size={20} /> },
    { path: '/status', name: 'Status Tracking', icon: <Activity size={20} /> },
    { path: '/messages', name: 'Consultant Messages', icon: <MessageSquare size={20} /> },
    { path: '/college-finder', name: 'College Finder ML', icon: <Search size={20} /> },
    { path: '/consultancy-finder', name: 'Consultancy Match ML', icon: <Compass size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <ul>
          <li>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} 
            >
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </li>
          <li>
            <a href={import.meta.env.VITE_STUDENT_PORTAL_URL} className="nav-link">
              <Compass size={20} />
              <span>Back to Home</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
