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

interface AgencyResponse {
  token: string;
  agency: {
    id: string;
    name: string;
    email: string;
    description?: string;
    logo?: string;
    website?: string;
    phoneNumber?: string;
    address?: string;
    verified: boolean;
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

/**
 * Agency login with email and password
 * @param email Agency's email
 * @param password Agency's password
 * @returns Promise with agency data and token
 */
export const agencyLogin = async (email: string, password: string): Promise<AgencyResponse> => {
  try {
    const response = await axiosInstance.post<AgencyResponse>('/agency/login', {
      email,
      password,
    });
    
    // Save token to localStorage for future requests
    localStorage.setItem('auth_token', response.data.token);
    
    return response.data;
  } catch (error) {
    console.error('Agency login failed:', error);
    throw error;
  }
};

/**
 * Register a new agency
 * @param agencyData Agency registration data including contact and business details
 * @returns Promise with agency data and token
 */
export interface AgencyRegisterData {
  email: string;
  name: string;
  password: string;
  description?: string;
  logo?: string;
  website?: string;
  phoneNumber?: string;
  address?: string;
}

export const registerAgency = async (agencyData: AgencyRegisterData): Promise<AgencyResponse> => {
  try {
    const response = await axiosInstance.post<AgencyResponse>('/agency/register', agencyData);
    
    // Save token to localStorage for future requests
    localStorage.setItem('auth_token', response.data.token);
    
    return response.data;
  } catch (error) {
    console.error('Agency registration failed:', error);
    throw error;
  }
};

/**
 * Get agency profile information
 * @returns Promise with agency profile data
 */
export const getAgencyProfile = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/agency/profile');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch agency profile:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated as an agency
 * @returns boolean indicating agency authentication status
 */
export const isAgencyAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) return false;
  
  try {
    const userData = JSON.parse(user);
    return userData.role === 'AGENCY';
  } catch (error) {
    console.error('Error checking agency authentication:', error);
    return false;
  }
};

/**
 * Logout agency user by removing the token and user data
 */
export const agencyLogout = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};
