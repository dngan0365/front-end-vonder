"use client"
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, isLoggedIn } from '@/api/auth';

// Interface for the user object
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  image: string;
}

// Interface for the context value
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<User | null>;
  updateUser: (userData: Partial<User>) => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
  refreshUser: async () => Promise.resolve(null),
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

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

  // Logout function
  const logout = () => {
    apiLogout();
    setUser(null);
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
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
    refreshUser,
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
export type { User };
