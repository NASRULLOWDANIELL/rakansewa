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

// Housemate & Matching endpoints
export const getHousematesByPropertyId = async (propertyId) => {
  const response = await api.get(`/housemates/property/${propertyId}`);
  return response.data;
};

export const findHousemateMatches = async (propertyId, preferences) => {
  const response = await api.post(`/matching/${propertyId}`, preferences);
  return response.data;
};

export const getAllHousemates = async () => {
  const response = await api.get('/housemates');
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

// Auth / Password Reset endpoints
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
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

export default api;
