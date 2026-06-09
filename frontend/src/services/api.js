import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Property endpoints
export const getProperties = async () => {
  const response = await api.get('/properties');
  return response.data;
};

export const getPropertyById = async (id) => {
  const response = await api.get(`/properties/${id}`);
  return response.data;
};

export const createProperty = async (property) => {
  const response = await api.post('/properties', property);
  return response.data;
};

export const updateProperty = async (id, property) => {
  const response = await api.put(`/properties/${id}`, property);
  return response.data;
};

export const deleteProperty = async (id) => {
  const response = await api.delete(`/properties/${id}`);
  return response.data;
};

export const getPropertiesByOwner = async (ownerId) => {
  const response = await api.get(`/properties/owner/${ownerId}`);
  return response.data;
};

export const getApprovedProperties = async () => {
  const response = await api.get('/properties/approved');
  return response.data;
};

export const approveProperty = async (id) => {
  const response = await api.put(`/admin/properties/${id}/approve`);
  return response.data;
};

export const rejectProperty = async (id, reason) => {
  const response = await api.put(`/admin/properties/${id}/reject`, { reason });
  return response.data;
};

export const resubmitProperty = async (id, property) => {
  const response = await api.put(`/properties/${id}/resubmit`, property);
  return response.data;
};

// Matching endpoint (users-based)
export const getMatchesForUser = async (userId) => {
  const response = await api.get(`/matching/user/${userId}`);
  return response.data;
};

// User Endpoints
export const createUser = async (user) => {
  const response = await api.post('/users', user);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const updateUser = async (id, user) => {
  const response = await api.put(`/users/${id}`, user);
  return response.data;
};

// User property linking (replaces old housemate profile linking)
export const linkUserToProperty = async (userId, propertyId) => {
  const response = await api.put(`/users/${userId}/link-property`, { propertyId });
  return response.data;
};

// Auth / Password Reset endpoints
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const googleLoginUser = async (name, email) => {
  const response = await api.post('/auth/google-login', { name, email });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/reset-password', { token, newPassword });
  return response.data;
};

// Feedback endpoints
export const submitFeedback = async (feedback) => {
  const response = await api.post('/feedbacks', feedback);
  return response.data;
};

export const getAllFeedbacks = async () => {
  const response = await api.get('/feedbacks');
  return response.data;
};

export const resolveFeedback = async (id) => {
  const response = await api.put(`/feedbacks/${id}/resolve`);
  return response.data;
};

// File upload
export const uploadPropertyImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload/property-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Favourite endpoints
export const toggleFavourite = async (userEmail, propertyId) => {
  const response = await api.post('/favorites/toggle', { userEmail, propertyId });
  return response.data;
};

export const getUserFavourites = async (userEmail) => {
  const response = await api.get(`/favorites/user/${encodeURIComponent(userEmail)}`);
  return response.data;
};

export default api;
