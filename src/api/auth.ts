import axiosInstance from './axiosInstance';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    image: string;
  };
}

/**
 * Login with email and password
 * @param email User's email
 * @param password User's password
 * @returns Promise with user data and token
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    
    // Save token to localStorage for future requests
    localStorage.setItem('auth_token', response.data.token);
    
    return response.data;
  } catch (error) {
    // Handle specific error cases or rethrow
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * Register with email, name, and password
 * @param email User's email
 * @param name User's full name
 * @param password User's password
 * @returns Promise with user data and token
 */
export const register = async (email: string, name: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/users', {
      email,
      name,
      password
    });
    
    console.log('Registration response:', response); 
    // Save token to localStorage for future requests
    localStorage.setItem('auth_token', response.data.token);
    
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

/**
 * Logout user by removing the token
 */
export const logout = (): void => {
  localStorage.removeItem('auth_token');
};

/**
 * Check if user is currently logged in
 * @returns boolean indicating login status
 */
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('auth_token');
};

/**
 * Get current auth token
 * @returns Current auth token or null
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};
