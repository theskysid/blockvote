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
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    
    const verifyWallet = async () => {
      const walletVerified = sessionStorage.getItem('walletVerified') === 'true';
      const registeredWallet = sessionStorage.getItem('walletAddress');
      
      if (!walletVerified || !registeredWallet) {
        alert('Please connect and verify your MetaMask wallet first!');
        navigate('/wallet-connect', {
          state: { mobileNumber: userData.mobileNumber, userRole: userData.role }
        });
        return;
      }
      
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
            alert(`Wallet mismatch! You must use your registered wallet: ${registeredWallet}`);
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
    
    const interval = setInterval(() => {
      loadResults();
      loadElectionStatus();
    }, 5000);
    
    return () => clearInterval(interval);
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
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleCreateElection = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.createElection();
      if (response.data.success) {
        showMessage('success', '✅ Election created successfully!');
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
        showMessage('success', '✅ Candidate added successfully!');
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
        showMessage('success', '🚀 Election started successfully!');
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
        showMessage('success', '⏹️ Election stopped successfully!');
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
    sessionStorage.clear();
    navigate('/');
  };

  if (!user) return null;

  const totalVotes = results?.totalVotes || 0;
  const candidates = results?.results || [];
  const registeredWallet = sessionStorage.getItem('walletAddress');
  
  // Calculate winner
  const winner = candidates.length > 0 ? candidates.reduce((prev, current) => 
    (prev.voteCount > current.voteCount) ? prev : current
  ) : null;

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🗳️</div>
          <h2 style={styles.logoText}>BlockVOTE</h2>
          <span style={styles.adminBadge}>ADMIN</span>
        </div>

        <nav style={styles.nav}>
          <button
            onClick={() => setActiveTab('overview')}
            style={activeTab === 'overview' ? {...styles.navButton, ...styles.navButtonActive} : styles.navButton}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            style={activeTab === 'manage' ? {...styles.navButton, ...styles.navButtonActive} : styles.navButton}
          >
            ⚙️ Manage Election
          </button>
          <button
            onClick={() => setActiveTab('results')}
            style={activeTab === 'results' ? {...styles.navButton, ...styles.navButtonActive} : styles.navButton}
          >
            📈 Live Results
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.walletInfo}>
            <span style={styles.walletLabel}>🦊 Wallet</span>
            <span style={styles.walletAddress}>
              {registeredWallet ? `${registeredWallet.substring(0, 6)}...${registeredWallet.substring(38)}` : 'Not connected'}
            </span>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Admin Dashboard</h1>
            <p style={styles.subtitle}>Manage elections and monitor voting progress</p>
          </div>
          {electionStatus && (
            <div style={styles.statusBadge(electionStatus.status)}>
              {electionStatus.status === 'ACTIVE' && '🟢'}
              {electionStatus.status === 'CREATED' && '🟡'}
              {electionStatus.status === 'STOPPED' && '🔴'}
              {' '}{electionStatus.status}
            </div>
          )}
        </div>

        {/* Messages */}
        {message.text && (
          <div style={message.type === 'success' ? styles.alertSuccess : styles.alertError}>
            {message.text}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>🗳️</div>
                <div>
                  <div style={styles.statValue}>{totalVotes}</div>
                  <div style={styles.statLabel}>Total Votes</div>
                </div>
              </div>
              
              <div style={styles.statCard}>
                <div style={styles.statIcon}>👥</div>
                <div>
                  <div style={styles.statValue}>{candidates.length}</div>
                  <div style={styles.statLabel}>Candidates</div>
                </div>
              </div>
              
              <div style={styles.statCard}>
                <div style={styles.statIcon}>🏆</div>
                <div>
                  <div style={styles.statValue}>{winner?.name || 'TBD'}</div>
                  <div style={styles.statLabel}>Leading Candidate</div>
                </div>
              </div>
              
              <div style={styles.statCard}>
                <div style={styles.statIcon}>📊</div>
                <div>
                  <div style={styles.statValue}>
                    {winner && totalVotes > 0 ? `${((winner.voteCount / totalVotes) * 100).toFixed(1)}%` : '0%'}
                  </div>
                  <div style={styles.statLabel}>Leading %</div>
                </div>
              </div>
            </div>

            {/* Chart */}
            {candidates.length > 0 && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Vote Distribution</h3>
                <div style={styles.chartContainer}>
                  {candidates.map((candidate, index) => {
                    const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
                    return (
                      <div key={candidate.id} style={styles.barWrapper}>
                        <div style={styles.barLabel}>
                          <span style={styles.candidateName}>{candidate.name}</span>
                          <span style={styles.candidateParty}>{candidate.party}</span>
                        </div>
                        <div style={styles.barContainer}>
                          <div style={{
                            ...styles.bar,
                            width: `${percentage}%`,
                            background: `linear-gradient(90deg, ${getColor(index)}, ${getColorLight(index)})`
                          }}>
                            <span style={styles.barText}>
                              {candidate.voteCount} votes ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Timeline */}
            {electionStatus && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Election Timeline</h3>
                <div style={styles.timeline}>
                  {electionStatus.createdAt && (
                    <div style={styles.timelineItem}>
                      <div style={styles.timelineDot}>📅</div>
                      <div style={styles.timelineContent}>
                        <div style={styles.timelineTitle}>Created</div>
                        <div style={styles.timelineDate}>
                          {new Date(electionStatus.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                  {electionStatus.startedAt && (
                    <div style={styles.timelineItem}>
                      <div style={styles.timelineDot}>🚀</div>
                      <div style={styles.timelineContent}>
                        <div style={styles.timelineTitle}>Started</div>
                        <div style={styles.timelineDate}>
                          {new Date(electionStatus.startedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                  {electionStatus.stoppedAt && (
                    <div style={styles.timelineItem}>
                      <div style={styles.timelineDot}>⏹️</div>
                      <div style={styles.timelineContent}>
                        <div style={styles.timelineTitle}>Stopped</div>
                        <div style={styles.timelineDate}>
                          {new Date(electionStatus.stoppedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Election Controls</h3>
              <div style={styles.buttonGrid}>
                <button
                  onClick={handleCreateElection}
                  disabled={loading || (electionStatus && electionStatus.status !== 'STOPPED')}
                  style={styles.actionButton}
                >
                  <span style={styles.buttonIcon}>📋</span>
                  <span>Create Election</span>
                </button>
                
                <button
                  onClick={handleStartElection}
                  disabled={loading || !electionStatus || electionStatus.status !== 'CREATED'}
                  style={{...styles.actionButton, ...styles.successButton}}
                >
                  <span style={styles.buttonIcon}>🚀</span>
                  <span>Start Election</span>
                </button>
                
                <button
                  onClick={handleStopElection}
                  disabled={loading || !electionStatus || electionStatus.status !== 'ACTIVE'}
                  style={{...styles.actionButton, ...styles.dangerButton}}
                >
                  <span style={styles.buttonIcon}>⏹️</span>
                  <span>Stop Election</span>
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Add Candidate</h3>
              <form onSubmit={handleAddCandidate} style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>👤 Candidate Name</label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="Enter candidate name"
                      required
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>🎯 Party Name</label>
                    <input
                      type="text"
                      value={candidateParty}
                      onChange={(e) => setCandidateParty(e.target.value)}
                      placeholder="Enter party name"
                      required
                      style={styles.input}
                    />
                  </div>
                </div>
                
                <button type="submit" disabled={loading} style={styles.submitButton}>
                  <span style={styles.buttonIcon}>➕</span>
                  Add Candidate
                </button>
              </form>
            </div>

            {candidates.length > 0 && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Registered Candidates ({candidates.length})</h3>
                <div style={styles.candidateList}>
                  {candidates.map((candidate, index) => (
                    <div key={candidate.id} style={styles.candidateCard}>
                      <div style={styles.candidateNumber}>{index + 1}</div>
                      <div style={styles.candidateInfo}>
                        <div style={styles.candidateName}>{candidate.name}</div>
                        <div style={styles.candidateParty}>{candidate.party}</div>
                      </div>
                      <div style={styles.candidateVotes}>
                        {candidate.voteCount} votes
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div>
            {candidates.length > 0 ? (
              <>
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Live Voting Results</h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Rank</th>
                        <th style={styles.th}>Candidate</th>
                        <th style={styles.th}>Party</th>
                        <th style={styles.th}>Votes</th>
                        <th style={styles.th}>Percentage</th>
                        <th style={styles.th}>Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates
                        .sort((a, b) => b.voteCount - a.voteCount)
                        .map((candidate, index) => {
                          const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
                          return (
                            <tr key={candidate.id} style={styles.tr}>
                              <td style={styles.td}>
                                {index === 0 && <span style={styles.trophy}>🏆</span>}
                                #{index + 1}
                              </td>
                              <td style={styles.td}><strong>{candidate.name}</strong></td>
                              <td style={styles.td}>{candidate.party}</td>
                              <td style={styles.td}><strong>{candidate.voteCount}</strong></td>
                              <td style={styles.td}>{percentage.toFixed(2)}%</td>
                              <td style={styles.td}>
                                <div style={styles.progressBar}>
                                  <div style={{
                                    ...styles.progress,
                                    width: `${percentage}%`,
                                    background: getColor(index)
                                  }} />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {winner && (
                  <div style={styles.winnerCard}>
                    <div style={styles.winnerBadge}>🏆 Current Leader</div>
                    <div style={styles.winnerName}>{winner.name}</div>
                    <div style={styles.winnerParty}>{winner.party}</div>
                    <div style={styles.winnerStats}>
                      {winner.voteCount} votes • {totalVotes > 0 ? ((winner.voteCount / totalVotes) * 100).toFixed(1) : 0}% of total
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📋</div>
                <h3>No Candidates Yet</h3>
                <p>Add candidates in the Manage Election tab to see results here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const getColor = (index) => {
  const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
  return colors[index % colors.length];
};

const getColorLight = (index) => {
  const colors = ['#764ba2', '#f5576c', '#00f2fe', '#38f9d7', '#fee140'];
  return colors[index % colors.length];
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8f9fa',
    fontFamily: "'Inter', sans-serif",
  },
  sidebar: {
    width: '280px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    padding: '30px 20px',
  },
  logo: {
    marginBottom: '40px',
  },
  logoIcon: {
    fontSize: '48px',
    marginBottom: '10px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 5px 0',
  },
  adminBadge: {
    background: 'rgba(255,255,255,0.2)',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  navButton: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    padding: '14px 16px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  navButtonActive: {
    background: 'rgba(255,255,255,0.25)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  sidebarFooter: {
    borderTop: '1px solid rgba(255,255,255,0.2)',
    paddingTop: '20px',
    marginTop: '20px',
  },
  walletInfo: {
    background: 'rgba(255,255,255,0.1)',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  walletLabel: {
    fontSize: '12px',
    opacity: 0.8,
  },
  walletAddress: {
    fontSize: '13px',
    fontWeight: '600',
  },
  logoutButton: {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  main: {
    flex: 1,
    padding: '40px',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 5px 0',
    color: '#1a202c',
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
    margin: 0,
  },
  statusBadge: (status) => ({
    padding: '10px 20px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    background: status === 'ACTIVE' ? '#48bb78' : status === 'CREATED' ? '#ecc94b' : '#f56565',
    color: 'white',
  }),
  alertSuccess: {
    padding: '16px 20px',
    background: '#c6f6d5',
    color: '#22543d',
    borderRadius: '12px',
    marginBottom: '20px',
    fontWeight: '500',
  },
  alertError: {
    padding: '16px 20px',
    background: '#fed7d7',
    color: '#742a2a',
    borderRadius: '12px',
    marginBottom: '20px',
    fontWeight: '500',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    fontSize: '32px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a202c',
  },
  statLabel: {
    fontSize: '14px',
    color: '#718096',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 20px 0',
    color: '#1a202c',
  },
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  barWrapper: {
    marginBottom: '15px',
  },
  barLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  candidateName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#2d3748',
  },
  candidateParty: {
    fontSize: '14px',
    color: '#718096',
  },
  barContainer: {
    background: '#f7fafc',
    borderRadius: '8px',
    height: '40px',
    position: 'relative',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '12px',
    transition: 'width 0.5s ease',
    minWidth: '80px',
  },
  barText: {
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  timelineItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  timelineDot: {
    fontSize: '24px',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '4px',
  },
  timelineDate: {
    fontSize: '14px',
    color: '#718096',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  actionButton: {
    padding: '16px',
    fontSize: '15px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'transform 0.2s',
  },
  successButton: {
    background: 'linear-gradient(135deg, #48bb78, #38a169)',
  },
  dangerButton: {
    background: 'linear-gradient(135deg, #f56565, #e53e3e)',
  },
  buttonIcon: {
    fontSize: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
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
    padding: '12px 14px',
    fontSize: '15px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    outline: 'none',
  },
  submitButton: {
    padding: '14px',
    fontSize: '15px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  candidateList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px',
  },
  candidateCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#f7fafc',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
  },
  candidateNumber: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '18px',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateVotes: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#667eea',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #e2e8f0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#718096',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid #f7fafc',
  },
  td: {
    padding: '16px 12px',
    fontSize: '14px',
    color: '#2d3748',
  },
  trophy: {
    marginRight: '8px',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#f7fafc',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    transition: 'width 0.5s ease',
  },
  winnerCard: {
    background: 'linear-gradient(135deg, #ffd89b, #19547b)',
    padding: '40px',
    borderRadius: '20px',
    textAlign: 'center',
    color: 'white',
  },
  winnerBadge: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '10px',
  },
  winnerName: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  winnerParty: {
    fontSize: '20px',
    opacity: 0.9,
    marginBottom: '16px',
  },
  winnerStats: {
    fontSize: '16px',
    opacity: 0.85,
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#718096',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
};

export default AdminDashboard;
