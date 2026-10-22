import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const consultancyPortalUrl = import.meta.env.VITE_CONSULTANCY_PORTAL_URL || 'http://localhost:5174';
      const adminPortalUrl = import.meta.env.VITE_ADMIN_PORTAL_URL || 'http://localhost:5175';

      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (role === 'student') {
        navigate('/dashboard');
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
          <h1>Create Your Account</h1>
          <p>Join AdmitBridge to start your study abroad journey.</p>
          
          <div className="role-tabs" style={{marginBottom: '20px'}}>
            <button type="button" className={`role-tab ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>Student</button>
            <button type="button" className={`role-tab ${role === 'consultancy' ? 'active' : ''}`} onClick={() => setRole('consultancy')}>Consultancy</button>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            
            <button type="submit" className="btn-primary w-100" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          
          <p className="auth-footer">
            Already have an account? <a href="/login">Sign In</a>
          </p>
        </div>
      </div>
      <div className="auth-right auth-right-register">
        <div className="auth-testimonial">
          <h2>"AdmitBridge's personalized college suggestions were incredibly accurate."</h2>
          <p>- David Chen, Accepted to MIT</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
