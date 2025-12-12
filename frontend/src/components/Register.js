import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

function Register() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!/^\d{10}$/.test(mobileNumber)) {
      setError('Mobile number must be exactly 10 digits');
      setLoading(false);
      return;
    }

    if (!walletAddress || walletAddress.trim() === '') {
      setError('Wallet address is required');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register(mobileNumber, walletAddress);
      
      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card">
        <div className="header">
          <h1>Register Voter</h1>
          <p>Create your voting account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mobile Number *</label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 10-digit mobile number"
              required
              maxLength="10"
            />
            <small style={{ color: '#718096', fontSize: '12px' }}>
              Must be 10 digits
            </small>
          </div>

          <div className="form-group">
            <label>Wallet Address *</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter your MetaMask wallet address"
              required
            />
            <small style={{ color: '#718096', fontSize: '12px' }}>
              Enter your actual MetaMask wallet address (e.g., 0xABC123...)
            </small>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginBottom: '10px' }}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Back to Login
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '15px', background: '#edf2f7', borderRadius: '4px' }}>
          <p style={{ margin: '0 0 10px', fontWeight: '600' }}>Registration Info:</p>
          <ul style={{ margin: '10px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
            <li>Mobile number must be unique</li>
            <li>Wallet address must be unique</li>
            <li>Use OTP <strong>123456</strong> to login after registration</li>
            <li>You'll be registered as a VOTER</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Register;
