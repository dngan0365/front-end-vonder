import axiosInstance from './axiosInstance';

// event type definition based on Prisma schema
export interface Event {
    id: string,
    name: string,
    description: string,
    coverImage: string,
    location: string[],
    startDate: Date,
    endDate: Date,
    createdAt: Date,
    updatedAt: Date
}

// Create a new event
export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const response = await axiosInstance.post<Event>(`event`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Cache timeout in milliseconds (e.g., 1 hour)
const CACHE_TIMEOUT = 60 * 60 * 1000;

// Enhanced getAllLocations with caching
export const getAllEvents = async (forceRefresh = false) => {
  try {
    const response = await axiosInstance.get<Event[]>(`event`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get a single event by ID
export const getEventById = async (id: string) => {
  try {
    const response = await axiosInstance.get<Event>(`event/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};


// Update a event
export const updateEvent = async (id: string, eventData: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>) => {
  try {
    console.log('Updating event with ID:', id, 'and data:', eventData);
    const response = await axiosInstance.patch<Event>(`event/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete a event
export const deleteEvent = async (id: string) => {
  try {
    const response = await axiosInstance.delete<Event>(`event/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Get favorite locations for a user
export const getSaveEvent = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`event/saved/${userId}`);
    // Extract the event objects from each favorite item
    interface SavedEventItem {
        event: Event;
    }
    const locations = response.data.map((item: SavedEventItem) => item.event);
    return locations;
  } catch (error) {
    console.error('Error fetching save event:', error);
    throw error;
  }
}

// Add a event to favorites
export const addSaveEvent = async (userId: string, eventId: string) => {
  try {
    const response = await axiosInstance.post(`/event/saved/`, { userId, eventId });
    return response.data;
  } catch (error) {
    console.error('Error adding save event:', error);
    throw error;
  }
};

// Remove a event from favorites
export const removeSaveEvent = async (userId: string, eventId: string) => {
  try {
    const response = await axiosInstance.delete(`/event/saved/${userId}/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing save event:', error);
    throw error;
  }
};

// Check if event is saved by user
export const isEventSaved = async (userId: string, eventId: string) => {
  try {
    const response = await axiosInstance.get(`/event/saved/${userId}/${eventId}`);
    return response.data.isSaved;
  } catch (error) {
    console.error('Error checking saved status:', error);
    return false;
  }
};

// Get saved count for an event
export const getSavedCount = async (eventId: string) => {
  try {
    const response = await axiosInstance.get(`/event/saved/${eventId}`);
    return response.data.count;
  } catch (error) {
    console.error('Error getting saved count:', error);
    return 0;
  }
};
