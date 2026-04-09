import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API Services
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (email, password) => api.post('/auth/signup', { email, password }),
  verifyToken: (token) => api.get('/auth/verify', { headers: { Authorization: `Bearer ${token}` } }),
}

export const dataAPI = {
  uploadDataset: (formData) => api.post('/data/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDatasets: () => api.get('/data/datasets'),
  getDataset: (id) => api.get(`/data/datasets/${id}`),
  updateDataset: (id, data) => api.put(`/data/datasets/${id}`, data),
  deleteDataset: (id) => api.delete(`/data/datasets/${id}`),
}

export const analyticsAPI = {
  executeQuery: (query) => api.post('/analytics/query', { query }),
  getPredefinedQueries: () => api.get('/analytics/predefined'),
  getQueryHistory: () => api.get('/analytics/history'),
  getDashboardStats: () => api.get('/analytics/dashboard'),
}

export const aiAPI = {
  generateInsights: (datasetId, type) => api.post('/ai/insights', { datasetId, type }),
  getInsights: (datasetId) => api.get(`/ai/insights/${datasetId}`),
  runSimulation: (simulationData) => api.post('/ai/simulate', simulationData),
  getSimulations: () => api.get('/ai/simulations'),
}

export const healthAPI = {
  check: () => api.get('/health'),
}

// Utility function for handling API errors
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      success: false,
      message: error.response.data.message || 'Server error',
      status: error.response.status,
      data: error.response.data
    }
  } else if (error.request) {
    // Request was made but no response received
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      status: null,
      data: null
    }
  } else {
    // Something else happened
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      status: null,
      data: null
    }
  }
}

export default api
