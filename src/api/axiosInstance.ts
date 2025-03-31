import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

// Define base API URL - using the NEXT_PUBLIC_ prefix
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

console.log('Using API URL:', BASE_URL); // Debug log to verify URL

// Create axios instance with default configurations
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the auth token from localStorage if it exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const { response } = error;
    
    // Handle specific HTTP status codes
    if (response) {
      switch (response.status) {
        case 401: // Unauthorized
          // Handle token expiration - e.g., redirect to login
          if (typeof window !== 'undefined') {
            // Clear auth data
            localStorage.removeItem('auth_token');
            // Redirect to login page if needed
            // window.location.href = '/login';
          }
          break;
        case 403: // Forbidden
          console.error('Access forbidden');
          break;
        case 404: // Not Found
          console.error('Resource not found');
          break;
        case 500: // Server Error
          console.error('Server error');
          break;
        default:
          console.error('API request failed');
      }
    } else {
      // Network errors, server down, etc.
      console.error('Network error - no response received');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
