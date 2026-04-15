import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

export const getProperties = async () => {
  const response = await api.get('/properties');
  return response.data;
};

export const getPropertyById = async (id) => {
  const response = await api.get(`/properties/${id}`);
  return response.data;
};

export const getHousematesByPropertyId = async (propertyId) => {
  const response = await api.get(`/housemates/property/${propertyId}`);
  return response.data;
};

/**
 * Rule-based housemate matching.
 * Sends user preferences to the backend and receives ranked matches.
 *
 * @param {number} propertyId - The property to match housemates under
 * @param {object} preferences - User preference fields for rule-based matching
 * @returns {Promise<Array>} Sorted list of matching results (best first)
 */
export const findHousemateMatches = async (propertyId, preferences) => {
  const response = await api.post(`/matching/${propertyId}`, preferences);
  return response.data;
};

export default api;
