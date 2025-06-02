import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

// Define base API URL - using the NEXT_PUBLIC_ prefix for client-side access
const BASE_URL = process.env.NEXT_PUBLIC_AI_API_URL;

console.log('Using API AI URL:', BASE_URL); // Debug log to verify URL

// Create axios instance with default configurations
const axiosInstanceAI: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Enhanced request interceptor with better logging
axiosInstanceAI.interceptors.request.use(
  (config) => {
    console.log('Sending request to:', `${BASE_URL}${config.url}`, 'with method:', config.method);
    if (typeof window !== 'undefined') {
      console.log('Window object is available, proceeding with request');
      const token = localStorage.getItem('auth_token');
        if (token) {
          console.log('Token found in localStorage:', token);
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
     (error) => {
      console.error('Request interceptor error:', error.message);
      return Promise.reject(error);
     }
    // Get the auth token from localStorage if it exists
    // const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    // If token exists, add it to request headers
    // if (token) {
    //   console.log('Token:', token);
    //   config.headers.Authorization = `Bearer ${token}`;
    //   config.headers['Authorization'] = `Bearer ${token}`;
    //   console.log('Token found and added to request');
    // } else {
    //   console.log('No token found in localStorage');
    // }
    
  //   console.log('Request headers:', config.headers);
  //   if (config.data) console.log('Request data:', config.data);
    
  //   return config;
  // },
  // (error: AxiosError) => {
  //   console.error('Request interceptor error:', error.message);
  //   return Promise.reject(error);
  // }
);

// Enhanced response interceptor with better error logging
axiosInstanceAI.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('Response received:', response.status, response.statusText);
    return response;
  },
  (error: AxiosError) => {
    if (error.request && !error.response) {
      console.error('Request was made but no response received', error.request);
    } else if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
      
      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 401: // Unauthorized
          console.error('Unauthorized access - token might be invalid');
          // Handle token expiration - e.g., redirect to login
          if (typeof window !== 'undefined') {
            // Clear auth data
            localStorage.removeItem('auth_token');
            // Redirect to login page if needed
            // window.location.href = '/login';
          }
          break;
        case 403: // Forbidden
          console.error('Access forbidden - insufficient permissions');
          break;
        case 404: // Not Found
          console.error('Resource not found - endpoint might be incorrect');
          break;
        case 500: // Server Error
          console.error('Server error - check backend logs');
          break;
        default:
          console.error('API request failed with status', error.response.status);
      }
    } else {
      // Network errors, server down, etc.
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstanceAI;