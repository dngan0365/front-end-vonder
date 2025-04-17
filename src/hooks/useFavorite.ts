import { useState, useEffect } from 'react';
import { getFavoriteLocations, addFavoriteLocation, removeFavoriteLocation } from '@/api/location';
import { useAuth } from '@/context/AuthContext';
import { Location } from '@/api/location';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated || !user) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await getFavoriteLocations(user.id);
        console.log('Fetched favorites:', data);
        
        // The getFavoriteLocations function now returns the location objects directly
        setFavorites(data);
        
        // Cache favorites for this user
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(data));
        
      } catch (err) {
        setError('Failed to load favorites');
        console.error('Error loading favorites:', err);
        
        // Try to load from cache if available
        const cachedFavorites = localStorage.getItem(`favorites_${user.id}`);
        if (cachedFavorites) {
          setFavorites(JSON.parse(cachedFavorites));
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadFavorites();
  }, [isAuthenticated, user]);
  
  // Updated to accept a Location object instead of just an ID
  const addFavorite = async (location: Location) => {
    if (!isAuthenticated || !user) return;
    
    try {
      // Pass just the ID to the API
      await addFavoriteLocation(user.id, location.id);
      
      // Update local state with the full location object
      setFavorites(prev => {
        // Check if location is already in favorites
        if (!prev.some(fav => fav.id === location.id)) {
          const newFavorites = [...prev, location];
          // Cache updated favorites
          localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
          return newFavorites;
        }
        return prev;
      });
    } catch (err) {
      console.error('Error adding favorite:', err);
      setError('Failed to add favorite');
    }
  };
  
  // Updated to accept a Location object instead of just an ID
  const removeFavorite = async (location: Location) => {
    if (!isAuthenticated || !user) return;
    
    try {
      // Pass just the ID to the API
      await removeFavoriteLocation(user.id, location.id);
      
      // Update local state
      setFavorites(prev => {
        const newFavorites = prev.filter(fav => fav.id !== location.id);
        // Cache updated favorites
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
        return newFavorites;
      });
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Failed to remove favorite');
    }
  };
  
  // Update to check against location ID
  const isFavorite = (locationId: string) => {
    return favorites.some(location => location.id === locationId);
  };
  
  // Also update the refreshFavorites function for consistency
  const refreshFavorites = async () => {
    if (!isAuthenticated || !user) {
      setFavorites([]);
      return [];
    }
    
    try {
      setLoading(true);
      const locationData = await getFavoriteLocations(user.id);
      
      setFavorites(locationData);
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(locationData));
      
      return locationData;
    } catch (err) {
      setError('Failed to refresh favorites');
      console.error('Error refreshing favorites:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites
  };
};