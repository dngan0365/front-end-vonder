"use client"
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, isLoggedIn } from '@/app/api/auth';

// Interface for the user object
interface User {
  id: number;
  email: string;
  name: string;
  role: string;
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
    // Just return null if we can't find user data
    // This function doesn't make an API call since we're handling user data during login
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
          // Fetch user profile from localStorage or your API
          try {
            // Check if we have user data in localStorage
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
      
      // Store user info in localStorage for persistence
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      setIsAuthenticated(true);
    } catch (err: unknown) { // Change from any to unknown
      const error = err as ApiError; // Type assertion
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
      console.log('Registration response:', response); // Debugging line
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err: unknown) { // Change from any to unknown
      const error = err as ApiError; // Type assertion
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
    localStorage.removeItem('user'); // Clean up stored user data
  };

  // Clear any auth errors
  const clearError = () => {
    setError(null);
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
export type { User }
