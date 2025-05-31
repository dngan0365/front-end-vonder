import { User } from '@/context/AuthContext';
import axiosInstance from './axiosInstance';
import { Tour } from './tour';

// Define frontend schemas to match backend schemas
export interface CreateTourBookingInput {
  tourId: string;
  bookingDate: Date;
  participants: number;
  notes?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface UpdateTourBookingInput {
  status?: BookingStatus;
  participants?: number;
  notes?: string;
}

export interface TourBooking {
  id: string;
  userId: string;
  tourId: string;
  bookingDate: Date;
  participants: number;
  notes?: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  tour: Tour
  user: User
}

// Create a new tour booking
export const createTourBooking = async (
  userId: string,
  bookingData: CreateTourBookingInput
): Promise<TourBooking> => {
  try {
    const response = await axiosInstance.post('/tour-bookings', bookingData, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating tour booking:', error);
    throw error;
  }
};

// Get all bookings for a user
export const getUserBookings = async (userId: string): Promise<TourBooking[]> => {
  try {
    const response = await axiosInstance.get('/tour-bookings', {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

// Get a specific booking by ID
export const getBookingById = async (bookingId: string, userId: string): Promise<TourBooking> => {
  try {
    const response = await axiosInstance.get(`/tour-bookings/${bookingId}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking with id ${bookingId}:`, error);
    throw error;
  }
};

// Update a booking
export const updateTourBooking = async (
  bookingId: string, 
  userId: string,
  updateData: UpdateTourBookingInput
): Promise<TourBooking> => {
  try {
    const response = await axiosInstance.patch(`/tour-bookings/${bookingId}`, updateData, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating booking with id ${bookingId}:`, error);
    throw error;
  }
};

// Cancel a booking
export const cancelTourBooking = async (bookingId: string, userId: string): Promise<TourBooking> => {
  try {
    const response = await axiosInstance.delete(`/tour-bookings/${bookingId}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error canceling booking with id ${bookingId}:`, error);
    throw error;
  }
};


export const getTourBookingsByTourId = async (tourId: string): Promise<TourBooking[]> => {
  try {
    const response = await axiosInstance.get(`/tour-bookings/tour/${tourId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bookings for tour with id ${tourId}:`, error);
    throw error;
  }
}

export const updateBookingStatus = async (bookingId: string): Promise<TourBooking> => {
  try {
    const response = await axiosInstance.patch(`/tour-bookings/${bookingId}/update-status`);
    return response.data;
  } catch (error) {
    console.error(`Error updating status for booking with id ${bookingId}:`, error);
    throw error;
  }
}