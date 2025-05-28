import { User } from '@/context/AuthContext';
import axiosInstance from './axiosInstance';
import { Tour } from './tour';

// Define frontend schemas to match backend schemas
export interface CreateTourReviewInput {
  tourId: string;
  rating: number;
  comment?: string;
}

export interface UpdateTourReviewInput {
  rating?: number;
  comment?: string;
}

export interface TourReview {
  id: string;
  userId: string;
  tourId: string;
  rating: number;
  comment?: string;
  createdAt: string; // Change to string as API returns ISO date strings
  updatedAt: string; // Change to string as API returns ISO date strings
  tour: Tour
  user: User;
}

export interface TourRating {
  averageRating: number;
  totalReviews: number;
}

// Create a new review
export const createTourReview = async (
  userId: string,
  reviewData: CreateTourReviewInput
): Promise<TourReview> => {
  try {
    const response = await axiosInstance.post('/tour-reviews', reviewData, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating tour review:', error);
    throw error;
  }
};

// Get all reviews for a specific tour
export const getTourReviews = async (tourId: string): Promise<TourReview[]> => {
  try {
    const response = await axiosInstance.get(`/tour-reviews/tour/${tourId}`);
    console.log('Fetched reviews:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for tour ${tourId}:`, error);
    throw error;
  }
};

// Get average rating for a tour
export const getTourAverageRating = async (tourId: string): Promise<TourRating> => {
  try {
    const response = await axiosInstance.get(`/tour-reviews/tour/${tourId}/rating`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching rating for tour ${tourId}:`, error);
    throw error;
  }
};

// Get all reviews by a user
export const getUserReviews = async (userId: string): Promise<TourReview[]> => {
  try {
    const response = await axiosInstance.get('/tour-reviews/user', {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

// Get a specific review by ID
export const getReviewById = async (reviewId: string): Promise<TourReview> => {
  try {
    const response = await axiosInstance.get(`/tour-reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching review with id ${reviewId}:`, error);
    throw error;
  }
};

// Update a review
export const updateTourReview = async (
  reviewId: string,
  userId: string,
  updateData: UpdateTourReviewInput
): Promise<TourReview> => {
  try {
    const response = await axiosInstance.patch(`/tour-reviews/${reviewId}`, updateData, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating review with id ${reviewId}:`, error);
    throw error;
  }
};

// Delete a review
export const deleteTourReview = async (reviewId: string, userId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/tour-reviews/${reviewId}`, {
      params: { userId }
    });
  } catch (error) {
    console.error(`Error deleting review with id ${reviewId}:`, error);
    throw error;
  }
};
