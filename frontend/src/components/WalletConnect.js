import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

const WalletConnect = ({ mobileNumber, userRole, onSuccess }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle, connecting, signing, verifying, success, error
  const [message, setMessage] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [challengeData, setChallengeData] = useState(null);
  const [hasMetaMask, setHasMetaMask] = useState(false);

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      setHasMetaMask(true);
      checkExistingWallet();
    } else {
      setHasMetaMask(false);
      setError('MetaMask is not installed. Please install MetaMask extension to continue.');
    }
  }, []);

  const checkExistingWallet = async () => {
    try {
      // Check if wallet is already registered
      const response = await authAPI.initWalletChallenge(mobileNumber);
      const data = response.data.data; // ApiResponse wraps data
      if (data.alreadyRegistered) {
        setWalletAddress(data.registeredWallet);
        setMessage(`Wallet already registered: ${data.registeredWallet}`);
        setStatus('success');
        
        // Auto-proceed to dashboard after 2 seconds
        setTimeout(() => {
          proceedToDashboard();
        }, 2000);
      }
    } catch (err) {
      console.error('Error checking wallet status:', err);
    }
  };

  const connectWallet = async () => {
    if (!hasMetaMask) {
      setError('Please install MetaMask first!');
      return;
    }

    try {
      setStatus('connecting');
      setError('');
      setMessage('Connecting to MetaMask...');

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const account = accounts[0];
      setWalletAddress(account);
      setMessage(`Connected: ${account.substring(0, 6)}...${account.substring(38)}`);

      // Get challenge message from backend
      setStatus('fetching-challenge');
      setMessage('Fetching challenge from server...');
      
      const challengeResponse = await authAPI.initWalletChallenge(mobileNumber);
      const challengeData = challengeResponse.data.data; // ApiResponse wraps data
      
      if (challengeData.alreadyRegistered) {
        // Wallet already registered
        if (challengeData.registeredWallet.toLowerCase() === account.toLowerCase()) {
          setStatus('success');
          setMessage('Wallet already verified! Proceeding...');
          setTimeout(() => proceedToDashboard(), 1500);
        } else {
          setStatus('error');
          setError(
            `Wallet mismatch! This mobile number is linked to: ${challengeData.registeredWallet}. ` +
            `You connected: ${account}. You cannot change your registered wallet.`
          );
        }
        return;
      }

      console.log('Challenge received:', challengeData);

      setChallengeData({
        message: challengeData.message,
        nonce: challengeData.nonce
      });

      // Request signature
      await requestSignature(account, challengeData.message, challengeData.nonce);

    } catch (err) {
      console.error('Error connecting wallet:', err);
      setStatus('error');
      
      if (err.code === 4001) {
        setError('Connection rejected. Please approve the MetaMask connection request.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    }
  };

  const requestSignature = async (account, challengeMessage, nonce) => {
    try {
      setStatus('signing');
      setMessage('Please sign the message in MetaMask...');

      // Request signature using personal_sign
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [challengeMessage, account]
      });

      // Verify signature with backend
      await verifySignature(account, signature, nonce);

    } catch (err) {
      console.error('Error signing message:', err);
      setStatus('error');
      
      if (err.code === 4001) {
        setError('Signature rejected. Please sign the message to verify your wallet.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to sign message. Please try again.');
      }
    }
  };

  const verifySignature = async (account, signature, nonce) => {
    try {
      setStatus('verifying');
      setMessage('Verifying signature...');

      console.log('Verification data:', {
        mobileNumber,
        walletAddress: account,
        nonce
      });

      const response = await authAPI.verifyWallet({
        mobileNumber: mobileNumber,
        walletAddress: account,
        signature: signature,
        nonce: nonce
      });

      setStatus('success');
      setMessage('✅ Wallet verified successfully! Redirecting...');

      // Store wallet verification status
      sessionStorage.setItem('walletVerified', 'true');
      sessionStorage.setItem('walletAddress', account);

      // Notify parent component
      if (onSuccess) {
        onSuccess(account);
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        proceedToDashboard();
      }, 2000);

    } catch (err) {
      console.error('Error verifying signature:', err);
      setStatus('error');
      setError(err.response?.data?.message || 'Failed to verify wallet. Please try again.');
    }
  };

  const proceedToDashboard = () => {
    if (userRole === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/voter');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Connect Your Wallet</h2>
        
        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            To ensure "One Person = One Vote", we need to verify your MetaMask wallet.
          </p>
          <p style={styles.infoText}>
            <strong>Mobile:</strong> {mobileNumber}
          </p>
          {walletAddress && (
            <p style={styles.infoText}>
              <strong>Wallet:</strong> {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
            </p>
          )}
        </div>

        {!hasMetaMask && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>❌ MetaMask Not Detected</p>
            <p style={styles.smallText}>
              Please install MetaMask extension from{' '}
              <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" style={styles.link}>
                metamask.io
              </a>
            </p>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {message && status !== 'error' && (
          <div style={styles.messageBox}>
            <p style={styles.messageText}>{message}</p>
          </div>
        )}

        {status === 'connecting' && (
          <div style={styles.loader}>
            <div style={styles.spinner}></div>
            <p>Connecting to MetaMask...</p>
          </div>
        )}

        {status === 'signing' && (
          <div style={styles.loader}>
            <div style={styles.spinner}></div>
            <p>Waiting for signature...</p>
            <p style={styles.smallText}>Please check your MetaMask popup</p>
          </div>
        )}

        {status === 'verifying' && (
          <div style={styles.loader}>
            <div style={styles.spinner}></div>
            <p>Verifying signature...</p>
          </div>
        )}

        {status === 'success' && (
          <div style={styles.successBox}>
            <p style={styles.successText}>✅ Wallet Verified!</p>
            <p style={styles.smallText}>Redirecting to dashboard...</p>
          </div>
        )}

        <div style={styles.buttonContainer}>
          {status === 'idle' && hasMetaMask && (
            <button onClick={connectWallet} style={styles.connectButton}>
              🦊 Connect MetaMask
            </button>
          )}

          {status === 'error' && hasMetaMask && (
            <button onClick={connectWallet} style={styles.retryButton}>
              🔄 Try Again
            </button>
          )}
        </div>

        <div style={styles.helpBox}>
          <p style={styles.helpText}>
            <strong>Why do we need this?</strong>
          </p>
          <p style={styles.smallText}>
            • Your wallet is permanently linked to your mobile number<br />
            • This ensures one person can only vote once<br />
            • You cannot change your wallet after binding<br />
            • Your vote is recorded on your wallet address
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
    fontSize: '28px'
  },
  infoBox: {
    background: '#f0f4ff',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '2px solid #667eea'
  },
  infoText: {
    margin: '8px 0',
    color: '#333',
    fontSize: '14px'
  },
  errorBox: {
    background: '#ffe6e6',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '2px solid #ff4444'
  },
  errorText: {
    color: '#cc0000',
    margin: '5px 0',
    fontWeight: 'bold'
  },
  messageBox: {
    background: '#e6f7ff',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '2px solid #1890ff'
  },
  messageText: {
    color: '#0066cc',
    margin: '5px 0',
    fontWeight: 'bold'
  },
  successBox: {
    background: '#e6ffe6',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '2px solid #00cc00',
    textAlign: 'center'
  },
  successText: {
    color: '#00cc00',
    margin: '5px 0',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  loader: {
    textAlign: 'center',
    padding: '20px',
    marginBottom: '20px'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 15px'
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px'
  },
  connectButton: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
  },
  retryButton: {
    background: '#ff9800',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  skipButton: {
    background: '#999',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  helpBox: {
    background: '#f9f9f9',
    padding: '15px',
    borderRadius: '10px',
    marginTop: '20px'
  },
  helpText: {
    color: '#333',
    margin: '5px 0',
    fontSize: '14px'
  },
  smallText: {
    fontSize: '12px',
    color: '#666',
    margin: '5px 0',
    lineHeight: '1.6'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default WalletConnect;
