import React, { useState, useEffect } from 'react';
import { BookOpen, Send, CheckCircle, Clock, LayoutDashboard } from 'lucide-react';
import './Dashboard.css';

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

const Dashboard = () => {
  const [activities, setActivities] = useState([
    { type: 'payment', title: 'Payment Approved for MIT Application Fee', time: '1 day ago', color: 'green' },
    { type: 'profile', title: 'Profile Updated successfully', time: '3 days ago', color: 'gold' }
  ]);
  const [error, setError] = useState(null);

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Time unknown';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Time unknown';
    
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' year ago' : ' years ago');
    
    interval = seconds / 2592000;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' month ago' : ' months ago');
    
    interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' day ago' : ' days ago');
    
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' hour ago' : ' hours ago');
    
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' minute ago' : ' minutes ago');
    
    return 'Just now';
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setError(null);
        const response = await authFetch(`${import.meta.env.VITE_API_URL}/applications`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const dynamicActivities = data.reverse().map(app => ({
            type: 'application',
            title: `Application Submitted to ${app.unis || 'University'} via ${app.consultancyName || 'Consultancy'}`,
            time: getTimeAgo(app.timestamp),
            color: 'blue'
          }));
          setActivities(prev => [...dynamicActivities, ...prev]);
        } else {
          setActivities(prev => [
            { type: 'application', title: 'Application Submitted to Stanford University', time: '2 hours ago', color: 'blue' },
            ...prev
          ]);
        }
      } catch (err) {
        console.warn("Backend offline or static mode - showing demo activities:", err);
        // Fallback data without displaying an intrusive error alert
        setActivities(prev => [
          { type: 'application', title: 'Application Submitted to Stanford University', time: '2 hours ago', color: 'blue' },
          ...prev
        ]);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="dashboard fade-in">
      {error && <div className="error-alert">{error}</div>}

      <div className="dashboard-content">
        <div className="card recent-activity">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            {activities.map((activity, index) => (
              <li className="activity-item" key={index}>
                <div className={`activity-dot ${activity.color}`}></div>
                <div className="activity-text">
                  <p><strong>{activity.title.split(' ')[0]} {activity.title.split(' ')[1]}</strong> {activity.title.split(' ').slice(2).join(' ')}</p>
                  <span>{activity.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card upcoming-deadlines">
          <h3>Upcoming Deadlines</h3>
          <ul className="deadline-list">
            <li className="deadline-item">
              <div className="date-box">
                <span className="month">Oct</span>
                <span className="day">15</span>
              </div>
              <div className="deadline-text">
                <p>Stanford Early Action</p>
                <span>in 2 weeks</span>
              </div>
            </li>
            <li className="deadline-item">
              <div className="date-box">
                <span className="month">Nov</span>
                <span className="day">01</span>
              </div>
              <div className="deadline-text">
                <p>MIT Regular Decision</p>
                <span>in 1 month</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
