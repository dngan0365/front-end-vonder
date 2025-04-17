"use client"

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTrip } from '@/hooks/useTrip';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { FaCalendarAlt, FaMapMarkerAlt, FaHotel, FaUsers, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';

export default function TripDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const t = useTranslations('Trip');
  const { user, isAuthenticated } = useAuth();
  const { 
    trip, 
    participants, 
    isLoading, 
    error, 
    fetchTripById, 
    fetchTripParticipants,
    deleteTrip,
    addParticipant,
    removeParticipant
  } = useTrip();
  
  const [isClient, setIsClient] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  const isMounted = useRef(true);

  useEffect(() => {
    setIsClient(true);
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isClient && id && typeof id === 'string') {
      fetchTripById(id);
    }
  }, [isClient, id, fetchTripById]);

  useEffect(() => {
    if (isClient && trip && id && typeof id === 'string') {
      fetchTripParticipants(id);
    }
  }, [isClient, trip, id, fetchTripParticipants]);

  useEffect(() => {
    if (isClient && !isAuthenticated && !isLoading) {
      router.push('/auth/login');
    }
  }, [isClient, isAuthenticated, isLoading, router]);

  const handleDelete = async () => {
    if (!trip) return;
    
    try {
      setDeleteError('');
      await deleteTrip(trip.id);
      router.push('/profile?tab=trips');
    } catch (error) {
      console.error('Failed to delete trip:', error);
      setDeleteError(t('deleteTripError'));
    } finally {
      setIsDeleteModalOpen(false);
    }
  };
  
  const handleJoin = async () => {
    if (!trip || !user) return;
    
    try {
      await addParticipant(trip.id, user.id);
      // Refresh participants list
      fetchTripParticipants(trip.id);
    } catch (error) {
      console.error('Failed to join trip:', error);
    }
  };
  
  const handleLeave = async () => {
    if (!trip || !user) return;
    
    try {
      await removeParticipant(trip.id, user.id);
      // Refresh participants list
      fetchTripParticipants(trip.id);
    } catch (error) {
      console.error('Failed to leave trip:', error);
    }
  };
  
  const isOwner = user && trip && participants?.some(p => p.userId === user.id);
  const isParticipant = user && trip && participants?.some(p => p.userId === user.id);
  
  const formatDate = (date: string | Date) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (!isClient) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-medium text-red-800 mb-2">
            {t('tripNotFound')}
          </h2>
          <p className="text-red-600 mb-4">{error || t('tripLoadError')}</p>
          <Link
            href="/profile?tab=trips"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            <FaArrowLeft className="mr-2" /> {t('backToTrips')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/profile?tab=trips"
        className="inline-flex items-center text-primary hover:underline mb-6"
      >
        <FaArrowLeft className="mr-2" /> {t('backToTrips')}
      </Link>
      
      {/* // Trip header with image - Fix the image source */}
      <div className="bg-white rounded-lg overflow-hidden shadow-md mb-8">
        {trip.location?.coverImage ? (
          <div className="relative h-64 w-full">
            <Image
              src={trip.location.coverImage}
              alt={trip.name || trip.location?.name || t('tripDetails')}
              fill
              style={{ objectFit: 'cover' }}
              className="brightness-90"
            />
            
            {/* Trip title overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h1 className="text-3xl font-bold text-white">
                {trip.name || t('unnamedTrip')}
              </h1>
            </div>
          </div>
        ) : (
          // Fallback when no image is available
          <div className="bg-gray-100 h-36 flex items-center justify-center">
            <div className="text-center p-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {trip.name || t('unnamedTrip')}
              </h1>
              <p className="text-gray-500 mt-2">{trip.location?.name}</p>
            </div>
          </div>
        )}
        
        {/* Trip details */}
        <div className="p-6">
          {/* Action buttons for trip owner */}
          {isOwner && (
            <div className="flex justify-end mb-4 gap-2">
              <Link 
                href={`/trip/${trip.id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <FaEdit className="mr-2" /> {t('edit')}
              </Link>
              
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <FaTrash className="mr-2" /> {t('delete')}
              </button>
            </div>
          )}
          
          {/* Trip info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Date info */}
            <div className="bg-gray-50 rounded-lg p-5">
              <div className="flex items-start">
                <FaCalendarAlt className="text-primary text-2xl mr-4 mt-1" />
                <div>
                  <h3 className="font-medium text-lg">{t('dates')}</h3>
                  <p className="text-gray-600">
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Location info */}
            <div className="bg-gray-50 rounded-lg p-5">
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-primary text-2xl mr-4 mt-1" />
                <div>
                  <h3 className="font-medium text-lg">{t('location')}</h3>
                  <p className="text-gray-600">
                    {trip.location?.name || t('unknownLocation')}
                  </p>
                  {(trip.location?.province || trip.location?.district) && (
                    <p className="text-gray-500 text-sm">
                      {trip.location.district && `${trip.location.district}, `}
                      {trip.location.province}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Hotel info if available */}
            {(trip.hotelName || trip.hotelAddress) && (
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="flex items-start">
                  <FaHotel className="text-primary text-2xl mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium text-lg">{t('accommodation')}</h3>
                    {trip.hotelName && (
                      <p className="text-gray-600">{trip.hotelName}</p>
                    )}
                    {trip.hotelAddress && (
                      <p className="text-gray-500 text-sm">{trip.hotelAddress}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Participants info */}
            <div className="bg-gray-50 rounded-lg p-5">
              <div className="flex items-start">
                <FaUsers className="text-primary text-2xl mr-4 mt-1" />
                <div>
                  <h3 className="font-medium text-lg">{t('participants')}</h3>
                  <p className="text-gray-600">
                    {participants?.length || 0} {t('people')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trip description */}
          {trip.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('description')}</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700">{trip.description}</p>
              </div>
            </div>
          )}
          
          {/* Location details with link */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{t('locationDetails')}</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-2">
                {trip.location?.name}
              </h3>
              
              {trip.location?.description && (
                <div className="prose max-w-none mb-4 text-gray-700">
                  {/* Use a limited preview of HTML description */}
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: trip.location.description.substring(0, 300) + '...' 
                    }} 
                  />
                </div>
              )}
              
              <Link
                href={`/location/${trip.locationId}`}
                className="inline-block mt-2 text-primary hover:underline"
              >
                {t('viewFullLocationDetails')}
              </Link>
            </div>
          </div>
          
          {/* Participants list */}
          <div>
            <h2 className="text-2xl font-bold mb-4">{t('participants')}</h2>
            
            {/* Join/Leave buttons */}
            {user && !isOwner && (
              <div className="mb-6">
                {!isParticipant ? (
                  <button
                    onClick={handleJoin}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                  >
                    {t('joinTrip')}
                  </button>
                ) : (
                  <button
                    onClick={handleLeave}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    {t('leaveTrip')}
                  </button>
                )}
              </div>
            )}
            
            {participants && participants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {participants.map((participant) => (
                  <div 
                    key={participant.id} 
                    className="flex items-center p-4 bg-white border rounded-lg shadow-sm"
                  >
                    <div className="relative h-10 w-10 mr-3">
                      {participant.user?.image ? (
                        <Image
                          src={participant.user.image}
                          alt={participant.user?.name || t('participant')}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {participant.user?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {participant.user?.name || t('unnamed')}
                      </p>
                      {participant.user?.email && (
                        <p className="text-sm text-gray-500">{participant.user.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{t('noParticipants')}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">{t('confirmDelete')}</h3>
            <p className="text-gray-700 mb-6">
              {t('deleteWarning')}
            </p>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
                {deleteError}
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}