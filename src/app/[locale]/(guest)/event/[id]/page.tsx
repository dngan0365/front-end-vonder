// pages/events/[id].tsx
'use client'
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext'
import { getEventById, addSaveEvent, removeSaveEvent, isEventSaved, getSavedCount } from '@/api/event';
import EventHeader from '@/components/event/EventHeader';
import EventDescription from '@/components/event/EventDescription';
import EventLocations from '@/components/event/EventLocations';
import EventActions from '@/components/event/EventActions';
import EventNotFound from '@/components/event/EventNotFound';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LoginPrompt from '@/components/auth/LoginPrompt';
import { Calendar, Clock } from 'lucide-react';

type Location = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
};

type EventLocation = {
  id: string;
  description: string | null;
  location: Location;
};

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

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [savingInProgress, setSavingInProgress] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    // Only fetch if we have an ID
    if (id) {
      fetchEventDetails(id as string);
    }
  }, [id]);

  useEffect(() => {
    // Check if event is saved when user logs in
    if (event?.id && user?.id) {
      checkIfEventIsSaved(event.id, user.id);
      fetchSavedCount(event.id);
    }
  }, [event?.id, user?.id]);

  const fetchEventDetails = async (eventId: string) => {
    setIsLoading(true);
    try {
      const eventData = await getEventById(eventId);
      setEvent(eventData);
      
      // If user is logged in, check if event is saved
      if (user?.id) {
        await checkIfEventIsSaved(eventId, user.id);
        await fetchSavedCount(eventId);
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfEventIsSaved = async (eventId: string, userId: string) => {
    try {
      const saved = await isEventSaved(userId, eventId);
      setIsSaved(saved);
    } catch (error) {
      console.error('Error checking if event is saved:', error);
    }
  };

  const fetchSavedCount = async (eventId: string) => {
    try {
      const count = await getSavedCount(eventId);
      setSavedCount(count);
    } catch (error) {
      console.error('Error fetching saved count:', error);
    }
  };

  const handleSaveEvent = async () => {
    if (!event) return;
    // If user is not logged in, show login prompt
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    setSavingInProgress(true);
    try {
      if (isSaved) {
        await removeSaveEvent(user?.id, event.id);
        setIsSaved(false);
        setSavedCount(prev => Math.max(0, prev - 1));
      } else {
        await addSaveEvent(user?.id, event.id);
        setIsSaved(true);
        setSavedCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to save/unsave event:', error);
    } finally {
      setSavingInProgress(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.name,
        text: `Check out this event: ${event?.name}`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
      alert('Link copied to clipboard!');
    }
  };

  const goBack = () => {
    router.back();
  };

  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return <EventNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EventHeader 
        coverImage={event.coverImage} 
        name={event.name} 
        goBack={goBack}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <EventActions 
              isSaved={isSaved} 
              savingInProgress={savingInProgress}
              savedCount={savedCount}
              onSave={handleSaveEvent}
              onShare={handleShare}
            />
            
            <div className="flex flex-col md:flex-row md:items-center text-gray-600 mt-4 mb-6">
              <div className="flex items-center mb-2 md:mb-0 md:mr-6">
                <span className="bg-cyan-100 p-2 rounded-full mr-3">
                  <Calendar size={18} className="text-cyan-400" />
                </span>
                <span>{format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center">
                <span className="bg-cyan-100 p-2 rounded-full mr-3">
                  <Clock size={18} className="text-cyan-400" />
                </span>
                <span>
                  {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                </span>
              </div>
            </div>
            {event.locations.length > 0 && (
              <EventLocations locations={event.locations} />
            )}
            <EventDescription description={event.description} />
          </div>
        </div>
      </div>

      {showLoginPrompt && (
        <LoginPrompt 
          message="Please sign in to save this event" 
          onClose={closeLoginPrompt} 
        />
      )}
    </div>
  );
}