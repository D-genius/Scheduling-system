import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.url?.includes('/o/token/')) {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    const { status } = error.response;
    
    if (status === 401) {
      localStorage.removeItem('access_token');
      window.location = '/login';
    }
    
    const errorMessage = error.response?.data?.detail || 
      error.response?.data?.message ||
      'An unexpected error occurred';
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;