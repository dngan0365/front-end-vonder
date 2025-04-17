import { useState, useEffect, useCallback, useRef } from 'react';
import * as tripApi from '../api/trip';

interface UseTripReturn {
  trips: tripApi.Trip[];
  trip: tripApi.Trip | null;
  participants: tripApi.TripParticipant[];
  userTrips: tripApi.Trip[];
  isLoading: boolean;
  error: string | null;
  fetchTrips: (filters?: {
    skip?: number;
    take?: number;
    locationId?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
  fetchTripById: (id: string) => Promise<void>;
  fetchUserTrips: (userId: string) => Promise<void>;
  fetchTripParticipants: (tripId: string) => Promise<void>;
  createTrip: (tripData: Omit<tripApi.Trip, 'id'>) => Promise<tripApi.Trip | undefined>;
  updateTrip: (id: string, tripData: Partial<tripApi.Trip>) => Promise<tripApi.Trip | undefined>;
  deleteTrip: (id: string) => Promise<void>;
  addParticipant: (tripId: string, userId: string) => Promise<tripApi.TripParticipant | undefined>;
  removeParticipant: (tripId: string, userId: string) => Promise<void>;
}

export const useTrip = (): UseTripReturn => {
  const [trips, setTrips] = useState<tripApi.Trip[]>([]);
  const [trip, setTrip] = useState<tripApi.Trip | null>(null);
  const [participants, setParticipants] = useState<tripApi.TripParticipant[]>([]);
  const [userTrips, setUserTrips] = useState<tripApi.Trip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async (filters?: {
    skip?: number;
    take?: number;
    locationId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tripApi.getAllTrips(filters);
      setTrips(data);
    } catch (err) {
      setError('Failed to fetch trips');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTripById = useCallback(async (id: string) => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await tripApi.getTripById(id);
      setTrip(data);
    } catch (err) {
      setError(`Failed to fetch trip with ID ${id}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserTrips = useCallback(async (userId: string) => {
    if (!userId) {
      console.error("No user ID provided to fetchUserTrips");
      return;
    }
  
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("🔄 Fetching trips for user:", userId);
      const data = await tripApi.getUserTrips(userId);
      console.log("📋 Raw API response:", data);
      
      if (Array.isArray(data)) {
        console.log(`✅ Setting userTrips state with ${data.length} trips`);
        setUserTrips(data);
      } else {
        console.error("❌ API did not return an array for user trips:", data);
        setUserTrips([]);
      }
    } catch (err) {
      const errorMessage = `Failed to fetch trips for user with ID ${userId}`;
      console.error(`❌ ${errorMessage}:`, err);
      setError(errorMessage);
      setUserTrips([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchTripParticipants = useCallback(async (tripId: string) => {
    if (!tripId) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await tripApi.getTripParticipants(tripId);
      setParticipants(data);
    } catch (err) {
      setError(`Failed to fetch participants for trip with ID ${tripId}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTrip = useCallback(async (tripData: Omit<tripApi.Trip, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTrip = await tripApi.createTrip(tripData);
      setTrips(prev => [newTrip, ...prev]);
      return newTrip;
    } catch (err) {
      setError('Failed to create trip');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTrip = useCallback(async (id: string, tripData: Partial<tripApi.Trip>) => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const updatedTrip = await tripApi.updateTrip(id, tripData);
      setTrips(prev => prev.map(trip => trip.id === id ? updatedTrip : trip));
      if (trip && trip.id === id) {
        setTrip(updatedTrip);
      }
      return updatedTrip;
    } catch (err) {
      setError(`Failed to update trip with ID ${id}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [trip]);

  const deleteTrip = useCallback(async (id: string) => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      await tripApi.deleteTrip(id);
      setTrips(prev => prev.filter(trip => trip.id !== id));
      if (trip && trip.id === id) {
        setTrip(null);
      }
    } catch (err) {
      setError(`Failed to delete trip with ID ${id}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [trip]);

  const addParticipant = useCallback(async (tripId: string, userId: string) => {
    if (!tripId || !userId) return;

    setIsLoading(true);
    setError(null);
    try {
      const newParticipant = await tripApi.addParticipant(tripId, userId);
      setParticipants(prev => [...prev, newParticipant]);
      return newParticipant;
    } catch (err) {
      setError(`Failed to add participant to trip with ID ${tripId}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeParticipant = useCallback(async (tripId: string, userId: string) => {
    if (!tripId || !userId) return;

    setIsLoading(true);
    setError(null);
    try {
      await tripApi.removeParticipant(tripId, userId);
      setParticipants(prev => prev.filter(p => !(p.tripId === tripId && p.userId === userId)));
    } catch (err) {
      setError(`Failed to remove participant from trip with ID ${tripId}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    trips,
    trip,
    participants,
    userTrips,
    isLoading,
    error,
    fetchTrips,
    fetchTripById,
    fetchUserTrips,
    fetchTripParticipants,
    createTrip,
    updateTrip,
    deleteTrip,
    addParticipant,
    removeParticipant
  };
};
