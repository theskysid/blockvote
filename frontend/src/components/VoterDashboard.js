import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { voterAPI } from '../api';

function VoterDashboard() {
  const [user, setUser] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'VOTER') {
      navigate('/');
      return;
    }
    setUser(userData);
    setHasVoted(userData.hasVoted);
    loadCandidates();
  }, [navigate]);

  const loadCandidates = async () => {
    try {
      const response = await voterAPI.getCandidates();
      if (response.data.success) {
        setCandidates(response.data.data);
      }
    } catch (err) {
      showMessage('error', 'Failed to load candidates');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleVote = async (candidateId) => {
    if (hasVoted) {
      showMessage('error', 'You have already voted!');
      return;
    }

    // Check wallet verification status
    const walletVerified = sessionStorage.getItem('walletVerified') === 'true';
    const registeredWallet = sessionStorage.getItem('walletAddress');
    
    if (!walletVerified || !registeredWallet) {
      showMessage('error', 'Please connect and verify your MetaMask wallet first!');
      navigate('/wallet-connect', {
        state: {
          mobileNumber: user.mobileNumber,
          userRole: user.role
        }
      });
      return;
    }

    // SECURITY: Verify the currently connected MetaMask wallet matches the registered one
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) {
          showMessage('error', 'MetaMask not connected. Please connect your wallet.');
          return;
        }
        
        const currentWallet = accounts[0].toLowerCase();
        const registered = registeredWallet.toLowerCase();
        
        if (currentWallet !== registered) {
          showMessage('error', 
            `Wallet mismatch! You must use your registered wallet: ${registeredWallet}. ` +
            `Currently connected: ${accounts[0]}`
          );
          return;
        }
      } else {
        showMessage('error', 'MetaMask is not installed!');
        return;
      }
    } catch (err) {
      showMessage('error', 'Failed to verify wallet connection');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to vote for this candidate? This action cannot be undone.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      // Use the registered wallet address from session
      const response = await voterAPI.castVote(
        user.mobileNumber,
        candidateId,
        registeredWallet
      );

      if (response.data.success) {
        showMessage('success', 'Vote cast successfully! Thank you for voting.');
        setHasVoted(true);
        
        // Update local storage
        const updatedUser = { ...user, hasVoted: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Reload candidates to see updated vote counts
        setTimeout(() => loadCandidates(), 1000);
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to cast vote');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleRefresh = () => {
    loadCandidates();
    showMessage('success', 'Candidate list refreshed!');
  };

  if (!user) return null;

  return (
    <div className="container">
      <div className="header">
        <h1>Voter Dashboard</h1>
        <p>Cast Your Vote</p>
      </div>

      <div className="dashboard-header">
        <div>
          <h2 style={{ margin: 0 }}>Welcome, Voter</h2>
          <div className="wallet-info" style={{ marginTop: '10px' }}>
            Wallet: {user.walletAddress}
          </div>
          {hasVoted && (
            <div className="alert alert-info" style={{ marginTop: '10px' }}>
              ✓ You have already voted
            </div>
          )}
        </div>
        <div className="button-group">
          <button onClick={handleRefresh} className="btn btn-secondary">
            Refresh
          </button>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <h3>Available Candidates</h3>
        
        {candidates.length > 0 ? (
          <div className="candidate-list">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="candidate-item">
                <div className="candidate-info">
                  <h3>{candidate.name}</h3>
                  <p>Party: {candidate.party}</p>
                  <p style={{ color: '#667eea', fontWeight: '600' }}>
                    Current Votes: {candidate.voteCount}
                  </p>
                </div>
                <button
                  onClick={() => handleVote(candidate.id)}
                  className="btn btn-primary"
                  disabled={hasVoted || loading}
                >
                  {hasVoted ? 'Already Voted' : 'Vote'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-info">
            No candidates available yet. Please wait for the admin to add candidates.
          </div>
        )}
      </div>

      <div className="card">
        <h3>Important Information</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>You can vote only once during an active election</li>
          <li>Your vote is linked to your wallet address: {user.walletAddress}</li>
          <li>Make sure to choose carefully before casting your vote</li>
          <li>Once voted, you cannot change your decision</li>
          <li>Voting is only allowed when the election is active</li>
        </ul>
      </div>
    </div>
  );
}

export default VoterDashboard;
