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
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await getAllUsers();
        if (response.success && response.data) {
          // Ensure users is an array
          const usersArray = Array.isArray(response.data) ? response.data : [];
          setUsers(usersArray);
        } else {
          setError(response.error || 'Failed to fetch users');
        }
      } catch (err) {
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
