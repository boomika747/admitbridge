import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('student');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const consultancyPortalUrl = import.meta.env.VITE_CONSULTANCY_PORTAL_URL || 'http://localhost:5174';
      const adminPortalUrl = import.meta.env.VITE_ADMIN_PORTAL_URL || 'http://localhost:5175';

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please verify your credentials.');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (role === 'student') {
        const redirectTo = location.state?.redirectTo || '/dashboard';
        navigate(redirectTo);
      } else if (role === 'consultancy') {
        window.location.href = `${consultancyPortalUrl}/?token=${data.token}`;
      } else if (role === 'admin') {
        window.location.href = `${adminPortalUrl}/?token=${data.token}`;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-left">
        <div className="auth-logo">
          <img src={logo} alt="AdmitBridge Logo" />
        </div>
        <div className="auth-content">
          <h1>Welcome Back to AdmitBridge</h1>
          <p>Sign in to continue to your dashboard.</p>
          
          <div className="role-tabs" role="tablist" aria-label="Select User Role">
            <button type="button" role="tab" aria-selected={role === 'student'} aria-label="Login as Student" className={`role-tab ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>Student</button>
            <button type="button" role="tab" aria-selected={role === 'consultancy'} aria-label="Login as Consultancy" className={`role-tab ${role === 'consultancy' ? 'active' : ''}`} onClick={() => setRole('consultancy')}>Consultancy</button>
            <button type="button" role="tab" aria-selected={role === 'admin'} aria-label="Login as Admin" className={`role-tab ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>Admin</button>
          </div>

          <form className="auth-form" onSubmit={handleLogin} aria-label="Login Form" noValidate>
            {error && <div className="error-message" role="alert" style={{color: 'var(--primary-color)', marginBottom: '10px', fontWeight: 'bold'}}>{error}</div>}
            <div className="form-group">
              <label htmlFor="emailInput">Email Address</label>
              <input id="emailInput" type="email" aria-label="Email Address" aria-required="true" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="passwordInput">Password</label>
              <input id="passwordInput" type="password" aria-label="Password" aria-required="true" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            
            <div className="auth-options">
              <label className="remember-me">
                <input type="checkbox" aria-label="Remember me" /> Remember me
              </label>
              <a href="#" className="forgot-password" aria-label="Forgot password?">Forgot password?</a>
            </div>
            
            <button type="submit" className="btn-primary w-100" aria-label="Sign In" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <p className="auth-footer">
            Don't have an account? <a href="/register" aria-label="Sign up for free">Sign up for free</a>
          </p>
        </div>
      </div>
      <div className="auth-right">
        {/* We can use an abstract background or image here */}
        <div className="auth-testimonial">
          <h2>"AdmitBridge made my Stanford application process completely stress-free!"</h2>
          <p>- Sarah Jenkins, MS Computer Science</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
