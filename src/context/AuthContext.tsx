"use client"
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  login as apiLogin, 
  register as apiRegister, 
  logout as apiLogout, 
  isLoggedIn,
  agencyLogin as apiAgencyLogin,
  registerAgency as apiRegisterAgency,
  AgencyRegisterData,
  getAgencyProfile as apiGetAgencyProfile,
  isAgencyAuthenticated as apiIsAgencyAuthenticated,
  agencyLogout as apiAgencyLogout
} from '@/api/auth';

// Interface for the user object
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  image: string;
}

// Interface for the agency profile object
interface AgencyProfile {
  id: string;
  name: string;
  email: string;
  description?: string;
  logo?: string;
  website?: string;
  phoneNumber?: string;
  address?: string;
  verified: boolean;
}

// Interface for the context value
interface AuthContextType {
  user: User | null;
  agencyProfile: AgencyProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAgency: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  agencyLogin: (email: string, password: string) => Promise<void>;
  registerAgency: (agencyData: AgencyRegisterData) => Promise<void>;
  logout: () => void;
  agencyLogout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<User | null>;
  refreshAgencyProfile: () => Promise<AgencyProfile | null>;
  updateUser: (userData: Partial<User>) => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  agencyProfile: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isAgency: false,
  login: async () => {},
  register: async () => {},
  agencyLogin: async () => {},
  registerAgency: async () => {},
  logout: () => {},
  agencyLogout: () => {},
  clearError: () => {},
  refreshUser: async () => Promise.resolve(null),
  refreshAgencyProfile: async () => Promise.resolve(null),
  updateUser: () => {},
});

// Props for AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [agencyProfile, setAgencyProfile] = useState<AgencyProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAgency, setIsAgency] = useState<boolean>(false);

  // Function to retrieve user profile from localStorage
  const fetchUserProfile = async (): Promise<User | null> => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  };

  // Check if user is logged in when component mounts
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const loggedIn = isLoggedIn();
        if (loggedIn) {
          setIsAuthenticated(true);
          try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              
              // Check if user is an agency
              const isAgencyUser = apiIsAgencyAuthenticated();
              setIsAgency(isAgencyUser);
              
              // Fetch agency profile if user is an agency
              if (isAgencyUser) {
                refreshAgencyProfile();
              }
            } else {
              const userProfile = await fetchUserProfile();
              setUser(userProfile);
            }
          } catch (userError) {
            console.error('Error loading user data:', userError);
          }
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiLogin(email, password);
      setUser(response.user);
      
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      console.log('Login response:', response.user);
      
      setIsAuthenticated(true);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.response?.data?.message || error.message || 'Failed to login');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email: string, name: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRegister(email, name, password);
      console.log('Registration response:', response);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.response?.data?.message || error.message || 'Failed to register');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }

  };

  // Agency Login function
  const agencyLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiAgencyLogin(email, password);
      console.log('Agency login response:', response);
      setUser({
        id: response.agency.id,
        email: response.agency.email,
        name: response.agency.name,
        role: 'agency', // or another appropriate role string
        image: response.agency.logo || '', // fallback to empty string if logo is undefined
      });
      setIsAgency(true);
      
      if (response.agency) {
        localStorage.setItem('user', JSON.stringify({
          id: response.agency.id,
          email: response.agency.email,
          name: response.agency.name,
          role: 'agency',
          image: response.agency.logo || '',
        }));
      }
      console.log('user:', localStorage.getItem('user'));
      
      // Fetch agency profile after successful login
      await refreshAgencyProfile();
      
      setIsAuthenticated(true);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.response?.data?.message || error.message || 'Failed to login as agency');
      console.error('Agency login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agency Register function
  const registerAgency = async (agencyData: AgencyRegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRegisterAgency(agencyData);
      console.log('Agency registration response:', response);
      setUser({
        id: response.agency.id,
        email: response.agency.email,
        name: response.agency.name,
        role: 'agency',
        image: response.agency.logo || '',
      });
      setIsAgency(true);
      
      // Fetch agency profile after successful registration
      await refreshAgencyProfile();
      
      setIsAuthenticated(true);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.response?.data?.message || error.message || 'Failed to register agency');
      console.error('Agency registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    apiLogout();
    setUser(null);
    setAgencyProfile(null);
    setIsAgency(false);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };
  
  // Agency Logout function
  const agencyLogout = () => {
    apiAgencyLogout();
    setUser(null);
    setAgencyProfile(null);
    setIsAgency(false);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  // Clear any auth errors
  const clearError = () => {
    setError(null);
  };

  // Function to refresh user data from local storage or API
  const refreshUser = async (): Promise<User | null> => {
    try {
      const newUser = await fetchUserProfile();
      if (newUser) {
        const userData = newUser;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  };

  // Function to refresh agency profile data
  const refreshAgencyProfile = async (): Promise<AgencyProfile | null> => {
    try {
      if (!isAuthenticated || !isAgency) return null;
      
      const agencyData = await apiGetAgencyProfile();
      if (agencyData) {
        setAgencyProfile(agencyData);
        return agencyData;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing agency profile:', error);
      return null;
    }
  };

  // Function to update user data (used for profile updates)
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Context value
  const value = {
    user,
    agencyProfile,
    loading,
    error,
    isAuthenticated,
    isAgency,
    login,
    register,
    agencyLogin,
    registerAgency,
    logout,
    agencyLogout,
    clearError,
    refreshUser,
    refreshAgencyProfile,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
export type { User, AgencyProfile };
