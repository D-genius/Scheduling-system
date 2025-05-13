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
    
    config.auth = {
      username: process.env.REACT_APP_CLIENT_ID,
      password: process.env.REACT_APP_CLIENT_SECRET,
    };
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const { status } = error.response;
    
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // localStorage.removeItem('access_token');
      // window.location = '/login';
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await api.post('/o/token/', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.REACT_APP_CLIENT_ID,
        client_secret: process.env.REACT_APP_CLIENT_SECRET
      });
      
      localStorage.setItem('access_token', response.data.access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location = '/login';
      }
    }
    
    const errorMessage = error.response?.data?.detail || 
      error.response?.data?.message ||
      'An unexpected error occurred';
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;