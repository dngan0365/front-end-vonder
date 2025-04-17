import axiosInstance from './axiosInstance';

// Trip interfaces based on Prisma schema
export interface Trip {
  id: string;
  name?: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  hotelName?: string;
  hotelAddress?: string;
  locationId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  location?: Location;
  participants?: TripParticipant[];
}

export interface TripParticipant {
  id: string;
  tripId: string;
  userId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  user?: User;
}

interface Location {
  id: string;
  name: string;
  // Add other location properties as needed
}

interface User {
  id: string;
  name: string;
  // Add other user properties as needed
}

// API functions for trips

/**
 * Fetch all trips with optional filtering parameters
 */
export const getAllTrips = async (params?: {
  skip?: number;
  take?: number;
  locationId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Trip[]> => {
  try {
    const response = await axiosInstance.get('/trips', { params });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch trips: ${error}`);
  }
};

/**
 * Get a specific trip by ID
 */
export const getTripById = async (id: string): Promise<Trip> => {
  try {
    const response = await axiosInstance.get(`/trips/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch trip: ${error}`);
  }
};

/**
 * Create a new trip
 */
export const createTrip = async (tripData: Omit<Trip, 'id'>): Promise<Trip> => {
  try {
    const response = await axiosInstance.post('/trips', tripData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create trip: ${error}`);
  }
};

/**
 * Update an existing trip
 */
export const updateTrip = async (id: string, tripData: Partial<Trip>): Promise<Trip> => {
  try {
    const response = await axiosInstance.patch(`/trips/${id}`, tripData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update trip: ${error}`);
  }
};

/**
 * Delete a trip
 */
export const deleteTrip = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/trips/${id}`);
  } catch (error) {
    throw new Error(`Failed to delete trip: ${error}`);
  }
};

/**
 * Add a participant to a trip
 */
export const addParticipant = async (tripId: string, userId: string): Promise<TripParticipant> => {
  try {
    const response = await axiosInstance.post(`/trips/${tripId}/participants`, { userId });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to add participant: ${error}`);
  }
};

/**
 * Remove a participant from a trip
 */
export const removeParticipant = async (tripId: string, userId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/trips/${tripId}/participants/${userId}`);
  } catch (error) {
    throw new Error(`Failed to remove participant: ${error}`);
  }
};

/**
 * Get all participants for a trip
 */
export const getTripParticipants = async (tripId: string): Promise<TripParticipant[]> => {
  try {
    const response = await axiosInstance.get(`/trips/${tripId}/participants`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch trip participants: ${error}`);
  }
};

/**
 * Get all trips for a user
 */
export const getUserTrips = async (userId: string): Promise<Trip[]> => {
  try {
    const response = await axiosInstance.get(`/trips/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch user trips: ${error}`);
  }
};
