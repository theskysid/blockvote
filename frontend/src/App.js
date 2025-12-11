import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import WalletConnect from './components/WalletConnect';
import AdminDashboard from './components/AdminDashboard';
import VoterDashboard from './components/VoterDashboard';
import './index.css';

// Wrapper component to handle route state
function WalletConnectWrapper() {
  const location = useLocation();
  const state = location.state || {};
  
  // Get mobile number from session storage as fallback
  const mobileNumber = state.mobileNumber || sessionStorage.getItem('mobileNumber');
  const userRole = state.userRole || JSON.parse(localStorage.getItem('user') || '{}').role;

  console.log('WalletConnect - mobile:', mobileNumber, 'role:', userRole);

  if (!mobileNumber) {
    return <Navigate to="/" />;
  }

  return <WalletConnect mobileNumber={mobileNumber} userRole={userRole} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/wallet-connect" element={<WalletConnectWrapper />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/voter" element={<VoterDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
