import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [candidateName, setCandidateName] = useState('');
  const [candidateParty, setCandidateParty] = useState('');
  const [results, setResults] = useState(null);
  const [electionStatus, setElectionStatus] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    
    // SECURITY: Verify wallet is connected and matches registered wallet
    const verifyWallet = async () => {
      const walletVerified = sessionStorage.getItem('walletVerified') === 'true';
      const registeredWallet = sessionStorage.getItem('walletAddress');
      
      if (!walletVerified || !registeredWallet) {
        alert('Please connect and verify your MetaMask wallet first!');
        navigate('/wallet-connect', {
          state: {
            mobileNumber: userData.mobileNumber,
            userRole: userData.role
          }
        });
        return;
      }
      
      // Verify currently connected wallet matches registered one
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length === 0) {
            alert('MetaMask not connected. Please connect your wallet.');
            navigate('/wallet-connect', {
              state: { mobileNumber: userData.mobileNumber, userRole: userData.role }
            });
            return;
          }
          
          const currentWallet = accounts[0].toLowerCase();
          const registered = registeredWallet.toLowerCase();
          
          if (currentWallet !== registered) {
            alert(
              `Wallet mismatch! You must use your registered wallet: ${registeredWallet}. ` +
              `Currently connected: ${accounts[0]}`
            );
            navigate('/');
            return;
          }
        } catch (err) {
          console.error('Failed to verify wallet:', err);
        }
      }
    };
    
    verifyWallet();
    setUser(userData);
    loadElectionStatus();
    loadResults();
  }, [navigate]);

  const loadElectionStatus = async () => {
    try {
      const response = await adminAPI.getElectionStatus();
      if (response.data.success) {
        setElectionStatus(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load election status');
    }
  };

  const loadResults = async () => {
    try {
      const response = await adminAPI.getResults();
      if (response.data.success) {
        setResults(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load results');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleCreateElection = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.createElection();
      if (response.data.success) {
        showMessage('success', 'Election created successfully!');
        loadElectionStatus();
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await adminAPI.addCandidate(candidateName, candidateParty);
      if (response.data.success) {
        showMessage('success', 'Candidate added successfully!');
        setCandidateName('');
        setCandidateParty('');
        loadResults();
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to add candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleStartElection = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.startElection();
      if (response.data.success) {
        showMessage('success', 'Election started successfully!');
        loadElectionStatus();
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to start election');
    } finally {
      setLoading(false);
    }
  };

  const handleStopElection = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.stopElection();
      if (response.data.success) {
        showMessage('success', 'Election stopped successfully!');
        loadElectionStatus();
        loadResults();
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to stop election');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleRefresh = () => {
    loadElectionStatus();
    loadResults();
    showMessage('success', 'Data refreshed!');
  };

  if (!user) return null;

  return (
    <div className="container">
      <div className="header">
        <h1>Admin Dashboard</h1>
        <p>Manage Elections & View Results</p>
      </div>

      <div className="dashboard-header">
        <div>
          <h2 style={{ margin: 0 }}>Welcome, Admin</h2>
          <div className="wallet-info" style={{ marginTop: '10px' }}>
            Wallet: {user.walletAddress}
          </div>
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

      {electionStatus && (
        <div className="card">
          <h3>Election Status</h3>
          <span className={`status-badge status-${electionStatus.status.toLowerCase()}`}>
            {electionStatus.status}
          </span>
          {electionStatus.createdAt && (
            <p style={{ marginTop: '10px' }}>
              Created: {new Date(electionStatus.createdAt).toLocaleString()}
            </p>
          )}
          {electionStatus.startedAt && (
            <p>Started: {new Date(electionStatus.startedAt).toLocaleString()}</p>
          )}
          {electionStatus.stoppedAt && (
            <p>Stopped: {new Date(electionStatus.stoppedAt).toLocaleString()}</p>
          )}
        </div>
      )}

      <div className="card">
        <h3>Election Management</h3>
        <div className="button-group">
          <button
            onClick={handleCreateElection}
            className="btn btn-primary"
            disabled={loading || (electionStatus && electionStatus.status !== 'STOPPED')}
          >
            Create Election
          </button>
          <button
            onClick={handleStartElection}
            className="btn btn-success"
            disabled={loading || !electionStatus || electionStatus.status !== 'CREATED'}
          >
            Start Election
          </button>
          <button
            onClick={handleStopElection}
            className="btn btn-danger"
            disabled={loading || !electionStatus || electionStatus.status !== 'ACTIVE'}
          >
            Stop Election
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Add Candidate</h3>
        <form onSubmit={handleAddCandidate}>
          <div className="form-group">
            <label>Candidate Name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Enter candidate name"
              required
            />
          </div>
          <div className="form-group">
            <label>Party Name</label>
            <input
              type="text"
              value={candidateParty}
              onChange={(e) => setCandidateParty(e.target.value)}
              placeholder="Enter party name"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Add Candidate
          </button>
        </form>
      </div>

      {results && (
        <div className="card">
          <h3>Live Results</h3>
          <div className="stats">
            <div className="stat-card">
              <h3>{results.totalVotes}</h3>
              <p>Total Votes Cast</p>
            </div>
            <div className="stat-card">
              <h3>{results.results.length}</h3>
              <p>Total Candidates</p>
            </div>
          </div>
          
          {results.results.length > 0 ? (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Party</th>
                  <th>Votes</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{candidate.name}</td>
                    <td>{candidate.party}</td>
                    <td>{candidate.voteCount}</td>
                    <td>
                      {results.totalVotes > 0
                        ? ((candidate.voteCount / results.totalVotes) * 100).toFixed(2)
                        : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No candidates added yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
