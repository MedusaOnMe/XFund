import axios from 'axios';

/**
 * API client for backend communication
 * In production: same server, use relative URLs
 * In dev: separate servers, use localhost:3001
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '' : 'http://localhost:3001');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Login or register with X handle
 */
export async function login(xHandle) {
  const response = await api.post('/api/login', { x_handle: xHandle });
  return response.data;
}

/**
 * Get wallet info
 */
export async function getWallet(userId) {
  const response = await api.get(`/api/wallet/${userId}`);
  return response.data;
}

/**
 * Request private key export
 */
export async function requestExport(userId, xHandle) {
  const response = await api.post('/api/export-request', {
    user_id: userId,
    x_handle: xHandle
  });
  return response.data;
}

/**
 * Get all campaigns
 */
export async function getCampaigns(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/api/campaigns?${params}`);
  return response.data.campaigns;
}

/**
 * Get campaign details
 */
export async function getCampaign(campaignId) {
  const response = await api.get(`/api/campaign/${campaignId}`);
  return response.data;
}

/**
 * Check export status (poll this every 2 seconds)
 */
export async function checkExportStatus(secretPath) {
  const response = await api.get(`/api/export-status/${secretPath}`);
  return response.data;
}

export default api;
