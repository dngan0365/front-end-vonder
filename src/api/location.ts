import axiosInstance from './axiosInstance';

// Location type definition based on Prisma schema
export interface Location {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  latitude?: number;
  longitude?: number;
  province: string;
  category: string;
  district?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create a new location
export const createLocation = async (locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const response = await axiosInstance.post<Location>(`location`, locationData);
    return response.data;
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;
  }
};

// Cache timeout in milliseconds (e.g., 1 hour)
const CACHE_TIMEOUT = 60 * 60 * 1000;

// Enhanced getAllLocations with caching
export const getAllLocations = async (forceRefresh = false) => {
  try {
    const cachedData = localStorage.getItem('cached_locations');
    const cachedTimestamp = localStorage.getItem('cached_locations_timestamp');
    
    // Use cache if it's not expired and we're not forcing a refresh
    if (
      !forceRefresh && 
      cachedData && 
      cachedTimestamp && 
      (Date.now() - parseInt(cachedTimestamp)) < CACHE_TIMEOUT
    ) {
      return JSON.parse(cachedData);
    }
    
    // Fetch fresh data
    const response = await axiosInstance.get<Location[]>(`location`);
    
    // Save to cache
    localStorage.setItem('cached_locations', JSON.stringify(response.data));
    localStorage.setItem('cached_locations_timestamp', Date.now().toString());
    
    return response.data;
  } catch (error) {
    // If fetch fails but we have cached data, return that
    const cachedData = localStorage.getItem('cached_locations');
    if (cachedData) {
      console.warn('Using cached locations due to fetch error');
      return JSON.parse(cachedData);
    }
    
    console.error('Error fetching locations:', error);
    throw error;
  }
};

// Get a single location by ID
export const getLocationById = async (id: string) => {
  try {
    const response = await axiosInstance.get<Location>(`location/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching location:', error);
    throw error;
  }
};

// Get locations by category
export const getLocationsByCategory = async (category: string) => {
  try {
    const response = await axiosInstance.get<Location[]>(`location/category/${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching locations by category:', error);
    throw error;
  }
};

// Update a location
export const updateLocation = async (id: string, locationData: Partial<Omit<Location, 'id' | 'createdAt' | 'updatedAt'>>) => {
  try {
    const response = await axiosInstance.patch<Location>(`location/${id}`, locationData);
    return response.data;
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
};

// Delete a location
export const deleteLocation = async (id: string) => {
  try {
    const response = await axiosInstance.delete<Location>(`location/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
};

// Get favorite locations for a user
export const getFavoriteLocations = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`location/favorite/${userId}`);
    // Extract the location objects from each favorite item
    const locations = response.data.map((item: any) => item.location);
    return locations;
  } catch (error) {
    console.error('Error fetching favorite locations:', error);
    throw error;
  }
}

// Add a location to favorites
export const addFavoriteLocation = async (userId: string, locationId: string) => {
  try {
    const response = await axiosInstance.post(`location/favorite`, { userId, locationId });
    return response.data;
  } catch (error) {
    console.error('Error adding favorite location:', error);
    throw error;
  }
};

// Remove a location from favorites
export const removeFavoriteLocation = async (userId: string, locationId: string) => {
  try {
    const response = await axiosInstance.delete(`location/favorite/${userId}/${locationId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing favorite location:', error);
    throw error;
  }
};
