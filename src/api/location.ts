import axios from 'axios';
import axiosInstance from './axiosInstance';

// Base URL for API requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
    const response = await axiosInstance.post<Location>(`${API_BASE_URL}/location`, locationData);
    return response.data;
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;
  }
};

// Get all locations
export const getAllLocations = async () => {
  try {
    const response = await axiosInstance.get<Location[]>(`${API_BASE_URL}/location`);
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

// Get a single location by ID
export const getLocationById = async (id: string) => {
  try {
    const response = await axiosInstance.get<Location>(`${API_BASE_URL}/location/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching location:', error);
    throw error;
  }
};

// Get locations by category
export const getLocationsByCategory = async (category: string) => {
  try {
    const response = await axiosInstance.get<Location[]>(`${API_BASE_URL}/location/category/${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching locations by category:', error);
    throw error;
  }
};

// Get locations by province
export const getLocationsByProvince = async (province: string) => {
  try {
    const response = await axios.get<Location[]>(`${API_BASE_URL}/location/province/${province}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching locations by province:', error);
    throw error;
  }
};

// Update a location
export const updateLocation = async (id: string, locationData: Partial<Omit<Location, 'id' | 'createdAt' | 'updatedAt'>>) => {
  try {
    const response = await axios.patch<Location>(`${API_BASE_URL}/location/${id}`, locationData);
    return response.data;
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
};

// Delete a location
export const deleteLocation = async (id: string) => {
  try {
    const response = await axios.delete<Location>(`${API_BASE_URL}/location/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
};
