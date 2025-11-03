import axios from 'axios';

/**
 * API client for backend communication
 * Uses relative URLs - Next.js rewrites proxy to backend
 */

const api = axios.create({
  baseURL: '',
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
 * Get campaigns created by a specific user
 */
export async function getUserCampaigns(userId) {
  const campaigns = await getCampaigns({ status: 'active' });
  return campaigns.filter(c => c.creator_user_id === userId);
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

/**
 * Request campaign metadata update
 */
export async function requestUpdate(campaignId, xHandle) {
  const response = await api.post('/api/update-request', {
    campaign_id: campaignId,
    x_handle: xHandle
  });
  return response.data;
}

/**
 * Check update status (poll this every 2 seconds)
 */
export async function checkUpdateStatus(secretPath) {
  const response = await api.get(`/api/update-status/${secretPath}`);
  return response.data;
}

/**
 * Update campaign metadata
 */
export async function updateMetadata(secretPath, metadata) {
  const response = await api.post('/api/update-metadata', {
    secret_path: secretPath,
    metadata
  });
  return response.data;
}

/**
 * Upload campaign image
 */
export async function uploadImage(imageFile, imageType) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('type', imageType);

  const response = await api.post('/api/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

export default api;
