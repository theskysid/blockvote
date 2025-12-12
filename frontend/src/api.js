import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  login: (mobileNumber, otp, walletAddress = null) =>
    api.post('/auth/login', { mobileNumber, otp, walletAddress }),
  register: (mobileNumber, walletAddress) =>
    api.post('/auth/register', { mobileNumber, walletAddress }),
  // Wallet verification endpoints
  initWalletChallenge: (mobileNumber) =>
    api.post('/auth/wallet-init', { mobileNumber }),
  verifyWallet: (data) =>
    api.post('/auth/verify-wallet', data),
};

export const adminAPI = {
  createElection: (title) => api.post('/admin/create-election', { title }),
  addCandidate: (name, party) =>
    api.post('/admin/add-candidate', { name, party }),
  startElection: () => api.post('/admin/start-election'),
  stopElection: () => api.post('/admin/stop-election'),
  getResults: () => api.get('/admin/results'),
  getElectionStatus: () => api.get('/admin/election-status'),
  getCurrentCandidates: () => api.get('/admin/candidates'),
  resetElection: () => api.post('/admin/reset-election'),
  // Archive endpoints
  getArchivedElections: () => api.get('/admin/archive'),
  getArchivedElection: (id) => api.get(`/admin/archive/${id}`),
  getElectionStatistics: (id) => api.get(`/admin/archive/${id}/statistics`),
};

export const voterAPI = {
  getCandidates: () => api.get('/voter/candidates'),
  castVote: (mobileNumber, candidateId, walletAddress) =>
    api.post('/voter/vote', { mobileNumber, candidateId, walletAddress }),
  hasVoted: (mobileNumber) => api.get(`/voter/has-voted/${mobileNumber}`),
};

export default api;
