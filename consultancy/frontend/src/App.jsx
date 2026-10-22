import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AssignedStudents from './pages/AssignedStudents';
import Applications from './pages/Applications';
import StatusUpdates from './pages/StatusUpdates';
import Meetings from './pages/Meetings';
import Messages from './pages/Messages';
import Settings from './pages/Settings';

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <Router basename={import.meta.env.BASE_URL || '/'}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assigned-students" element={<AssignedStudents />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/status-updates" element={<StatusUpdates />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
