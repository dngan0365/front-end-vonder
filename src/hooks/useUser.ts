import { useState, useEffect, useMemo } from 'react';
import { getAllUsers } from '@/api/user';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export const useUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    // Add these logs in the fetchUsers function
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      console.log("🔍 Fetching users...");
      const response = await getAllUsers();
      console.log("📋 User API response:", response);
      
      if (response.success && response.data) {
        // Ensure users is an array
        const usersArray = Array.isArray(response.data.data) ? response.data.data : [];
        console.log("✅ Found users:", usersArray.length);
        setUsers(usersArray);
      } else {
        console.error("❌ Failed to fetch users:", response.error);
        setError(response.error || 'Failed to fetch users');
      }
    } catch (err) {
      console.error("❌ Error in fetchUsers:", err);
      setError('An error occurred while fetching users');
    } finally {
      setIsLoading(false);
  }
};
    
    fetchUsers();
  }, []);
  
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    // Ensure users is an array before filtering
    const usersArray = Array.isArray(users) ? users : [];
    
    const lowercasedSearch = searchTerm.toLowerCase();
    return usersArray.filter(user => 
      user?.email?.toLowerCase().includes(lowercasedSearch) || 
      user?.name?.toLowerCase().includes(lowercasedSearch)
    );
  }, [users, searchTerm]);
  
  return {
    users,
    filteredUsers,
    searchTerm,
    setSearchTerm,
    isLoading,
    error
  };
};
