import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, CheckCircle, FileText, AlertCircle, CreditCard, Lock } from 'lucide-react';
import './Payments.css';

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};


const Payments = () => {
  const [file, setFile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0].name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0].name);
    }
  };

  const handleSubmitReceipt = async () => {
    if (!file) return;
    
    const pendingApp = applications.find(app => app.status === 'Pending' || app.status === 'Accepted');
    if (!pendingApp) {
      alert("No suitable applications found to submit documents for.");
      return;
    }
    
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await authFetch(`${import.meta.env.VITE_API_URL}/students/applications/${pendingApp._id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Under Review' })
      });
      
      // Future: replace with S3/GCS file storage backend
      await authFetch(`${import.meta.env.VITE_API_URL}/documents/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ filename: file, metadata: { type: 'receipt', appId: pendingApp._id } })
      });

      if (response.ok) {
        alert("Receipt/Documents submitted successfully! The consultant has been notified.");
        setFile(null);
        // Force refresh
        const refetch = await authFetch(`${import.meta.env.VITE_API_URL}/students/applications/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setApplications(await refetch.json());
      } else {
        setError("Failed to submit receipt to the server.");
      }
    } catch(err) {
      console.error(err);
      setError("Network error: Failed to submit receipt. Please try again.");
    }
  };

  const handlePayNow = async (appId) => {
    alert("Payment integration coming soon.");
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await authFetch(`${import.meta.env.VITE_API_URL}/students/applications/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setApplications(data);
          } else {
            setApplications(fallbackPayments);
          }
        } else {
          setApplications(fallbackPayments);
        }
      } catch (err) {
        console.warn("Backend offline or static mode - showing demo payments:", err);
        setApplications(fallbackPayments);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
    const interval = setInterval(fetchApplications, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="payments fade-in">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="page-header-text">
          <h1>Payments & Uploads</h1>
          <p>Manage your fee receipts and transaction details securely.</p>
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="payments-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Outstanding Payments Card */}
        <div className="card payments-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <CreditCard size={24} color="var(--primary-color)" />
            <h3 style={{ margin: 0 }}>Outstanding Payments</h3>
          </div>
          <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>Pay your consultancy fees once your profile is accepted.</p>
          
          <div className="fee-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <p>Loading...</p>
            ) : applications.length === 0 ? (
              <p>No active applications found.</p>
            ) : (
              applications.flatMap((app, appIndex) => {
                const unisList = app.unis ? app.unis.split(',').map(u => u.trim()) : ['University'];
                const isAccepted = app.status === 'Accepted' || app.status === 'Approved';
                
                return unisList.map((uni, uniIndex) => (
                  <div key={`${appIndex}-${uniIndex}`} className="fee-item fade-in" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isAccepted ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)', transition: 'all 0.3s' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-dark)' }}>Application Fee: {uni}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Via: {app.consultancyName || 'Consultancy'}</p>
                      <span className={`badge ${isAccepted ? 'badge-approved' : 'badge-review'}`} style={{ marginTop: '8px', display: 'inline-block' }}>
                        Application Status: {app.status}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-dark)', marginBottom: '8px' }}>
                        {app.fee ? `₹${app.fee.toLocaleString('en-IN')}` : '$150.00'}
                      </strong>
                      <button 
                        className={isAccepted ? "btn-primary" : "btn-secondary"} 
                        disabled={!isAccepted}
                        onClick={() => handlePayNow(app._id)}
                        style={{ opacity: !isAccepted ? 0.6 : 1, cursor: !isAccepted ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: isAccepted ? 'var(--success-color)' : '', borderColor: isAccepted ? 'var(--success-color)' : '' }}
                      >
                        {!isAccepted ? <Lock size={16} /> : <CheckCircle size={16} />}
                        Pay Now
                      </button>
                    </div>
                  </div>
                ));
              })
            )}
          </div>
        </div>

        <div className="card upload-card" onDragOver={handleDragOver} onDrop={handleDrop}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
            <UploadCloud size={24} color="var(--primary-color)" />
            <h3 style={{ margin: 0 }}>Upload Receipt</h3>
          </div>
          <p style={{ color: 'var(--text-light)', marginBottom: '15px' }}>Drag and drop your fee receipt here or click to browse.</p>
          <div className="upload-zone" onClick={handleBrowseClick} style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-light)', transition: 'all 0.3s' }}>
            <FileText size={40} className="upload-icon" style={{ color: 'var(--primary-color)', marginBottom: '10px' }} />
            <p style={{ color: 'var(--text-color)', fontWeight: '500' }}>{file ? file : "Select a file or drag and drop"}</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" />
            <button className="btn-primary mt-3" onClick={(e) => { e.stopPropagation(); handleBrowseClick(); }} style={{ marginTop: '15px' }}>Browse Files</button>
          </div>
          <button className="btn-secondary w-100 mt-3" style={{ width: '100%', marginTop: '15px', justifyContent: 'center' }} disabled={!file} onClick={handleSubmitReceipt}>Submit Receipt</button>
        </div>

        <div className="card transactions-card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '20px' }}>Recent Transactions</h3>
          <ul className="transaction-list">
            <li className="transaction-item">
              <div className="tx-icon success"><CheckCircle size={20} /></div>
              <div className="tx-details">
                <h4>Application Fee - Oxford</h4>
                <p>UTR: 987654321012</p>
              </div>
              <div className="tx-amount">
                <strong>$50.00</strong>
                <span className="badge badge-approved">Verified</span>
              </div>
            </li>
            <li className="transaction-item">
              <div className="tx-icon pending"><AlertCircle size={20} /></div>
              <div className="tx-details">
                <h4>Application Fee - Stanford</h4>
                <p>UTR: 123456789012</p>
              </div>
              <div className="tx-amount">
                <strong>$100.00</strong>
                <span className="badge badge-pending">Pending Review</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Payments;
