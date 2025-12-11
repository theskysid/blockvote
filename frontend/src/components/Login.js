import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

function Login() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(mobileNumber, otp);
      
      if (response.data.success) {
        const userData = response.data.data;
        
        // Store user data temporarily
        localStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('mobileNumber', mobileNumber);
        
        // OTP verified - now proceed to wallet verification
        setOtpVerified(true);
        setUserRole(userData.role);
        
        // Navigate to wallet connect page
        navigate('/wallet-connect', {
          state: {
            mobileNumber: mobileNumber,
            userRole: userData.role
          }
        });
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.brandSection}>
          <div style={styles.logoIcon}>🗳️</div>
          <h1 style={styles.brandTitle}>BlockVOTE</h1>
          <p style={styles.brandTagline}>Secure. Transparent. Decentralized.</p>
        </div>
        
        <div style={styles.featureList}>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🔐</span>
            <div>
              <h3 style={styles.featureTitle}>Blockchain Security</h3>
              <p style={styles.featureDesc}>Your vote is cryptographically secured</p>
            </div>
          </div>
          
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🦊</span>
            <div>
              <h3 style={styles.featureTitle}>MetaMask Integration</h3>
              <p style={styles.featureDesc}>One wallet, one vote - guaranteed</p>
            </div>
          </div>
          
          <div style={styles.feature}>
            <span style={styles.featureIcon}>✨</span>
            <div>
              <h3 style={styles.featureTitle}>Tamper-Proof</h3>
              <p style={styles.featureDesc}>Immutable voting records</p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.loginCard}>
          <h2 style={styles.loginTitle}>Welcome Back</h2>
          <p style={styles.loginSubtitle}>Sign in to cast your vote</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>📱 Mobile Number</label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter 10-digit mobile"
                required
                maxLength="10"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>🔑 One-Time Password</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                required
                maxLength="6"
                style={styles.input}
              />
            </div>

            {error && (
              <div style={styles.errorAlert}>
                ⚠️ {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              style={loading ? {...styles.primaryButton, ...styles.primaryButtonDisabled} : styles.primaryButton}
            >
              {loading ? '⏳ Signing in...' : '🚀 Sign In'}
            </button>

            <div style={styles.divider}>
              <span style={styles.dividerText}>New voter?</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/register')}
              style={styles.secondaryButton}
            >
              📝 Register Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: 'white',
  },
  brandSection: {
    marginBottom: '60px',
  },
  logoIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  brandTitle: {
    fontSize: '48px',
    fontWeight: '800',
    margin: '0 0 10px 0',
    letterSpacing: '-1px',
  },
  brandTagline: {
    fontSize: '20px',
    opacity: 0.9,
    margin: 0,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  feature: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
  },
  featureIcon: {
    fontSize: '32px',
    flexShrink: 0,
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 5px 0',
  },
  featureDesc: {
    fontSize: '14px',
    opacity: 0.85,
    margin: 0,
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    background: '#f8f9fa',
  },
  loginCard: {
    background: 'white',
    borderRadius: '24px',
    padding: '48px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
  },
  loginTitle: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#1a202c',
  },
  loginSubtitle: {
    fontSize: '16px',
    color: '#718096',
    margin: '0 0 32px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
  },
  input: {
    padding: '14px 16px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    transition: 'all 0.2s',
    outline: 'none',
  },
  errorAlert: {
    padding: '14px 16px',
    background: '#fed7d7',
    color: '#c53030',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
  },
  primaryButton: {
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
  },
  secondaryButton: {
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    background: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: '8px 0',
  },
  dividerText: {
    background: 'white',
    padding: '0 16px',
    color: '#a0aec0',
    fontSize: '14px',
    fontWeight: '500',
    position: 'relative',
    zIndex: 1,
  },
};


export default Login;
