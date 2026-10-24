import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CollegeSuggestions from './pages/CollegeSuggestions';
import Applications from './pages/Applications';
import Payments from './pages/Payments';
import StatusTracking from './pages/StatusTracking';
import Settings from './pages/Settings';
import CollegeFinderFrame from './pages/CollegeFinderFrame';
import ConsultancyFinderFrame from './pages/ConsultancyFinderFrame';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Register from './pages/Register';
import Resources from './pages/Resources';
import Home from './pages/Home';
import Messages from './pages/Messages';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL || '/'}>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/colleges" element={<CollegeSuggestions />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/status" element={<StatusTracking />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/college-finder" element={<CollegeFinderFrame />} />
            <Route path="/consultancy-finder" element={<ConsultancyFinderFrame />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
