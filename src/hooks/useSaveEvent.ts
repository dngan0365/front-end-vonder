'use client'
import { useState, useEffect } from 'react';
import { getSaveEvent, addSaveEvent, removeSaveEvent, isEventSaved, getSavedCount } from '@/api/event';
import { useAuth } from '@/context/AuthContext';

// Define the Event interface if not already defined elsewhere
type Event = {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  locations: EventLocation[];
};

type EventLocation = {
  id: string;
  name: string;
  province: string;
  // Add other necessary fields
};

export const useSaveEvent = () => {
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const loadSavedEvents = async () => {
      if (!isAuthenticated || !user) {
        setSavedEvents([]);
        setSavedEventIds([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Try to load from cache first
        const cachedEvents = localStorage.getItem(`savedEvents_${user.id}`);
        const cachedIds = localStorage.getItem(`savedEventIds_${user.id}`);
        
        if (cachedEvents) {
          setSavedEvents(JSON.parse(cachedEvents));
        }
        
        if (cachedIds) {
          setSavedEventIds(JSON.parse(cachedIds));
        }
        
        // Then fetch fresh data from API
        const data = await getSaveEvent(user.id);
        console.log('Fetched events:', data);
        
        if (data && Array.isArray(data)) {
          // Update saved events
          setSavedEvents(data);
          
          // Extract IDs for quick lookup
          const eventIds = data.map(event => event.id);
          setSavedEventIds(eventIds);
          
          // Cache the events
          localStorage.setItem(`savedEvents_${user.id}`, JSON.stringify(data));
          localStorage.setItem(`savedEventIds_${user.id}`, JSON.stringify(eventIds));
        }
      } catch (err) {
        setError('Failed to load saved events');
        console.error('Error loading saved events:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedEvents();
  }, [isAuthenticated, user]);
  
  const saveEvent = async (event: Event) => {
    if (!isAuthenticated || !user) return;
    
    try {
      await addSaveEvent(user.id, event.id);
      
      // Update local state
      setSavedEvents(prev => {
        // Check if event is already saved
        if (!prev.some(saved => saved.id === event.id)) {
          const newSavedEvents = [...prev, event];
          // Cache updated events
          localStorage.setItem(`savedEvents_${user.id}`, JSON.stringify(newSavedEvents));
          return newSavedEvents;
        }
        return prev;
      });
      
      setSavedEventIds(prev => {
        if (!prev.includes(event.id)) {
          const newIds = [...prev, event.id];
          localStorage.setItem(`savedEventIds_${user.id}`, JSON.stringify(newIds));
          return newIds;
        }
        return prev;
      });
      
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Failed to save event');
    }
  };
  
  const unsaveEvent = async (event: Event) => {
    if (!isAuthenticated || !user) return;
    
    try {
      await removeSaveEvent(user.id, event.id);
      
      // Update local state
      setSavedEvents(prev => {
        const newSavedEvents = prev.filter(saved => saved.id !== event.id);
        // Cache updated events
        localStorage.setItem(`savedEvents_${user.id}`, JSON.stringify(newSavedEvents));
        return newSavedEvents;
      });
      
      setSavedEventIds(prev => {
        const newIds = prev.filter(id => id !== event.id);
        localStorage.setItem(`savedEventIds_${user.id}`, JSON.stringify(newIds));
        return newIds;
      });
      
    } catch (err) {
      console.error('Error unsaving event:', err);
      setError('Failed to unsave event');
    }
  };
  
  const checkSavedStatus = async (eventId: string) => {
    if (!isAuthenticated || !user) return false;
    
    // First check local state
    if (savedEventIds.includes(eventId)) {
      return true;
    }
    
    try {
      // Fallback to API check
      const isSaved = await isEventSaved(user.id, eventId);
      
      // Update local state if needed
      if (isSaved && !savedEventIds.includes(eventId)) {
        setSavedEventIds(prev => {
          const newIds = [...prev, eventId];
          localStorage.setItem(`savedEventIds_${user.id}`, JSON.stringify(newIds));
          return newIds;
        });
      }
      
      return isSaved;
    } catch (err) {
      console.error('Error checking saved status:', err);
      return false;
    }
  };
  
  const getEventSavedCount = async (eventId: string) => {
    try {
      return await getSavedCount(eventId);
    } catch (err) {
      console.error('Error getting saved count:', err);
      return 0;
    }
  };
  
  const refreshSavedEvents = async () => {
    if (!isAuthenticated || !user) {
      setSavedEvents([]);
      setSavedEventIds([]);
      return [];
    }
    
    try {
      setLoading(true);
      
      // Fetch fresh data from API
      const data = await getSaveEvent(user.id);
      
      if (data && Array.isArray(data)) {
        // Update saved events
        setSavedEvents(data);
        
        // Extract IDs for quick lookup
        const eventIds = data.map(event => event.id);
        setSavedEventIds(eventIds);
        
        // Cache the events
        localStorage.setItem(`savedEvents_${user.id}`, JSON.stringify(data));
        localStorage.setItem(`savedEventIds_${user.id}`, JSON.stringify(eventIds));
        
        return data;
      }
      
      return [];
    } catch (err) {
      setError('Failed to refresh saved events');
      console.error('Error refreshing saved events:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  return {
    savedEvents,
    savedEventIds,
    loading,
    error,
    saveEvent,
    unsaveEvent,
    isSaved: (eventId: string) => savedEventIds.includes(eventId),
    checkSavedStatus,
    getEventSavedCount,
    refreshSavedEvents
  };
};