import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Consultancies from './pages/Consultancies';
import Settings from './pages/Settings';
import Applications from './pages/Applications';

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <Router basename={import.meta.env.BASE_URL || '/'}>
      <div className="layout-container">
        <Sidebar />
        <main className="main-content">
          <Header />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/consultancies" element={<Consultancies />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/settings" element={<Settings />} />
              {/* Future Routes */}
              <Route path="*" element={
                <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                  <h2 style={{color: 'var(--text-light)'}}>Module Coming Soon</h2>
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
