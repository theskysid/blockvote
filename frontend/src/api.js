import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  login: (mobileNumber, otp) =>
    api.post('/auth/login', { mobileNumber, otp }),
  register: (mobileNumber, walletAddress) =>
    api.post('/auth/register', { mobileNumber, walletAddress }),
  // Wallet verification endpoints
  initWalletChallenge: (mobileNumber) =>
    api.post('/auth/wallet-init', { mobileNumber }),
  verifyWallet: (data) =>
    api.post('/auth/verify-wallet', data),
};

export const adminAPI = {
  createElection: () => api.post('/admin/create-election'),
  addCandidate: (name, party) =>
    api.post('/admin/add-candidate', { name, party }),
  startElection: () => api.post('/admin/start-election'),
  stopElection: () => api.post('/admin/stop-election'),
  getResults: () => api.get('/admin/results'),
  getElectionStatus: () => api.get('/admin/election-status'),
};

export const voterAPI = {
  getCandidates: () => api.get('/voter/candidates'),
  castVote: (mobileNumber, candidateId, walletAddress) =>
    api.post('/voter/vote', { mobileNumber, candidateId, walletAddress }),
  hasVoted: (mobileNumber) => api.get(`/voter/has-voted/${mobileNumber}`),
};

export default api;
