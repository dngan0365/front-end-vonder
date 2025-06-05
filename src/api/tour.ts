// Re-export the interfaces and functions from the provided code
export interface Tour {
  id: string
  title: string
  description: string
  price: number
  duration: number
  category: string
  province: string
  images: string[]
  agencyId: string
  maxCapacity?: number
  itinerary?: string
  includes?: string
  excludes?: string
  startDates?: Date[]
  averageRating?: number  // Add this property
  totalReviews?: number   // Add this property
  // Add other tour properties as needed
}

export interface CreateTourDto {
  title: string
  description: string
  price: number
  duration: number
  category: string
  province: string
  images?: string[]
  maxCapacity?: number
  itinerary?: string
  includes?: string
  excludes?: string
  startDates?: Date[]
  // Add other properties needed for tour creation
}

export interface UpdateTourDto {
  title?: string
  description?: string
  price?: number
  duration?: number
  category?: string
  province?: string
  images?: string[]
  maxCapacity?: number
  itinerary?: string
  includes?: string
  excludes?: string
  startDates?: Date[]
  // Add other properties that can be updated
}

// Update your TourFilterParams interface
export interface TourFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: string;
  q?: string; // Add search parameter
}

import axiosInstance from "./axiosInstance"

// API functions
// Updated API function to match your service response
export const getTours = async (params: TourFilterParams = {}): Promise<{
  tours: Tour[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> => {
  try {
    const response = await axiosInstance.get("/tours", { params });
    
    // Transform the response to match expected format
    const { tours, total, pages } = response.data;
    const currentPage = params.page || 1;
    const limit = params.limit || 12;
    
    return {
      tours,
      pagination: {
        currentPage,
        totalPages: pages,
        totalItems: total,
        hasNext: currentPage < pages,
        hasPrev: currentPage > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching tours:", error);
    throw error;
  }
};

export const getTourById = async (id: string): Promise<Tour> => {
  try {
    const response = await axiosInstance.get(`/tours/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching tour with id ${id}:`, error)
    throw error
  }
}

export const createTour = async (tourData: CreateTourDto, agencyId: string): Promise<Tour> => {
  try {
    const response = await axiosInstance.post(`/tours?agencyId=${agencyId}`, tourData)
    return response.data
  } catch (error) {
    console.error("Error creating tour:", error)
    throw error
  }
}

export const updateTour = async (id: string, tourData: UpdateTourDto): Promise<Tour> => {
  try {
    const response = await axiosInstance.patch(`/tours/${id}`, tourData)
    return response.data
  } catch (error) {
    console.error(`Error updating tour with id ${id}:`, error)
    throw error
  }
}

export const deleteTour = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/tours/${id}`)
  } catch (error) {
    console.error(`Error deleting tour with id ${id}:`, error)
    throw error
  }
}

export const getToursByAgency = async (agencyId: string): Promise<Tour[]> => {
  try {
    const response = await axiosInstance.get(`/tours/agency/${agencyId}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching tours for agency ${agencyId}:`, error)
    throw error
  }
}

export const getToursByProvince = async (province: string): Promise<Tour[]> => {
  try {
    const response = await axiosInstance.get(`/tours/province/${province}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching tours for province ${province}:`, error)
    throw error
  }
}
