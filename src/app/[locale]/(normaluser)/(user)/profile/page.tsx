"use client"

import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/hooks/useFavorite";
import { useSaveEvent } from "@/hooks/useSaveEvent"
import { useTrip } from "@/hooks/useTrip";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { uploadImage } from "@/api/upload";
import { updateUserProfile } from "@/api/user";

type TabType = 'profile' | 'favorites' | 'trips' | 'savedEvents';

export default function ProfilePage({ params }: { params: Promise<{ locale: string }> | { locale: string } }) {
  const { user, logout, isAuthenticated, loading, refreshUser, updateUser } = useAuth();
  const { favorites, loading: favoritesLoading, error: favoritesError, removeFavorite, refreshFavorites } = useFavorites();
  const { userTrips, isLoading: tripsLoading, error: tripsError, fetchUserTrips } = useTrip();
  const { savedEvents, loading: saveEventLoading, error: saveEventError, unsaveEvent, refreshSavedEvents } = useSaveEvent();
  
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const t = useTranslations("Profile");
  const isMounted = useRef(true);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);

    // Add this state near your other state declarations
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Change your trip loading effect
  useEffect(() => {
    // Only load if authentication is ready and we haven't loaded yet
    if (isClient && isAuthenticated && user && !isDataLoaded) {
      const loadUserTrips = async () => {
        try {
          console.log("🔄 Loading user trips for", user.id);
          await fetchUserTrips(user.id);
          
          // Mark data as loaded only after the fetch completes
          setIsDataLoaded(true);
        } catch (error) {
          console.error('❌ Error loading trips:', error);
        }
      };
      
      loadUserTrips();
    }
  }, [isClient, isAuthenticated, user?.id, fetchUserTrips, isDataLoaded]);

  // Similarly update your favorites loading effect
  useEffect(() => {
    if (isClient && isAuthenticated && user && !isDataLoaded) {
      const loadFavorites = async () => {
        try {
          await refreshFavorites();
        } catch (error) {
          console.error('❌ Error loading favorites:', error);
        }
      };
      
      loadFavorites();
    }
  }, [isClient, isAuthenticated, user?.id, refreshFavorites, isDataLoaded]);

  useEffect(() => {
    if (isClient && isAuthenticated && user && !isDataLoaded) {
      const loadSaveEvents = async () => {
        try {
          await refreshSavedEvents();
          setIsDataLoaded(true); // Mark data as loaded
          console.log('✅ Events loaded successfully');
        } catch (error) {
          console.error('❌ Error loading events:', error);
        }
      };
      
      loadSaveEvents();
    }
  }, [isClient, isAuthenticated, user?.id, refreshSavedEvents, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      console.log('Current saved events:', savedEvents);
    }
  }, [savedEvents, isDataLoaded]);

  useEffect(() => {
    if (isClient && !loading && !isAuthenticated) {
      router.push(`/auth/login`);
    }
  }, [isAuthenticated, loading, router, isClient]);

  const handleLogout = () => {
    logout();
    router.push(`/`);
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const uploadResponse = await uploadImage(file);
      console.log("Upload response:", uploadResponse);
      
      if (!uploadResponse.success || !uploadResponse.url) {
        throw new Error(uploadResponse.error || "Failed to upload image");
      }

      const updateResponse = await updateUserProfile(user.id, { 
        image: uploadResponse.url 
      });

      console.log("Update response:", updateResponse);

      if (!updateResponse.success) {
        throw new Error(updateResponse.error || "Failed to update profile");
      }

      updateUser({ image: uploadResponse.url });
      await refreshUser();
      
    } catch (error) {
      console.error("Error during image upload:", error);
      setUploadError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    console.log("New name:", newName);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isClient || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <h2 className="text-xl font-bold mb-4">{t("authRequired")}</h2>
        <p className="mb-4">{t("pleaseLogin")}</p>
        <button
          onClick={() => router.push(`/auth/login`)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {t("goToLogin")}
        </button>
      </div>
    );
  }

  const TabNavigation = () => (
    <div className="flex flex-col space-y-2 mb-8">
      {[
        { id: 'profile', name: t('profileTab'), icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'trips', name: t('tripsTab'), icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        { id: 'favorites', name: t('favoritesTab'), icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
        { id: 'savedEvents', name: 'Saved Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as TabType)}
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            activeTab === tab.id 
              ? 'bg-blue-600 text-white' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
          </svg>
          <span>{tab.name}</span>
        </button>
      ))}
    </div>
  );

  const ProfileContent = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-6">
          {t("userProfile")}
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 relative">
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  fill
                  sizes="96px"
                  style={{ objectFit: 'cover' }}
                  className="rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              title="Upload your profile picture"
              placeholder="Choose a file"
            />
          </div>
          {uploadError && (
            <p className="text-red-500 text-sm mb-2">{`${t("uploadError")}: ${uploadError}`}</p>
          )}
          <button
            onClick={triggerFileInput}
            disabled={isUploading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                {t("uploading")}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {t("changeProfilePhoto")}
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              title="Change your name"
              type="text"
              value={user.name}
              onChange={handleNameChange}
              className="text-lg font-semibold border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-600 border border-gray-300 bg-gray-50 rounded px-3 py-2">{user.email}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold mb-2">
            {t("accountDetails")}
          </h3>
          <p className="text-gray-600 mb-1">
            <span className="font-medium">ID:</span> {user.id}
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            {t("logout")}
          </button>
        </div>
      </div>
    </div>
  );

  const FavoritesContent = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{t("favorites")}</h2>

      {favoritesLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mr-3"></div>
          <p>{t("loadingFavorites")}</p>
        </div>
      ) : favoritesError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{t("errorLoadingFavorites")}</p>
          <p className="mt-2">Error details: {String(favoritesError)}</p>
        </div>
      ) : !favorites || favorites.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-gray-600">{t("noFavorites")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favorites.map((location) => (
            <div key={location.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg">
              <div className="relative h-48 w-full">
                <Image
                  src={location.coverImage || '/images/placeholder.jpg'}
                  alt={location.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-xl mb-2 line-clamp-2">{location.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{location.province.replace('_', ' ')}</p>
                <div className="mt-4 flex justify-between">
                  <Link href={`/locations/${location.id}`}>
                    <span className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      {t("viewDetails")} →
                    </span>
                  </Link>
                  <button
                    onClick={() => removeFavorite(location)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t("removeFavorite")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const SaveEvent = () => (
    <div>
    <h2 className="text-2xl font-bold mb-6 text-gray-800">Save Events</h2>

    {saveEventLoading ? (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mr-3"></div>
        <p>Loading saved event</p>
      </div>
    ) : saveEventError ? (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{t("errorLoadingFavorites")}</p>
        <p className="mt-2">Error details: {String(saveEventError)}</p>
      </div>
    ) : !savedEvents || savedEvents.length === 0 ? (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p className="text-gray-600">Save event</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {savedEvents.map((event) => (
          <div key={location.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg">
            <div className="relative h-48 w-full">
              <Image
                src={event.coverImage || '/images/placeholder.jpg'}
                alt={event.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-xl mb-2 line-clamp-2">{event.name}</h3>
              <div className = "flex justify-between">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span>From: {formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span>To: {formatDate(event.endDate)}</span>
                </div>
              </div>
              {event.location && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location.name}, {event.location.province.replace('_', ' ')}</span>
                  </div>
                )}
              <div className="mt-4 flex justify-between">
                <Link href={`/locations/${event.id}`}>
                  <span className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    {t("viewDetails")} →
                  </span>
                </Link>
                <button
                  onClick={() => unsaveEvent(event)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t("removeFavorite")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
  )

  const TripsContent = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t("trips")}</h2>
        <Link href="/trips/create">
          <span className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Trip
          </span>
        </Link>
      </div>

      {tripsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mr-3"></div>
          <p>{t("loadingTrips")}</p>
        </div>
      ) : tripsError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{t("errorLoadingTrips")}</p>
          <p className="mt-2">Error details: {String(tripsError)}</p>
        </div>
      ) : !userTrips || userTrips.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-gray-600">{t("noTrips")}</p>
          <Link href="/trip/create">
            <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm">
              Create Your First Trip
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {userTrips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5">
                <h3 className="font-bold text-xl mb-2">{trip.name || "Unnamed Trip"}</h3>
                
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{t("startDate")}: {formatDate(trip.startDate)}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{t("endDate")}: {formatDate(trip.endDate)}</span>
                </div>
                
                {trip.location && (
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{trip.location.name}</span>
                  </div>
                )}
                
                {trip.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{trip.description}</p>
                )}
                
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <Link href={`/trip/${trip.id}`}>
                    <span className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                      {t("tripDetails")}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                  
                  <div className="flex items-center">
                    {trip.participants && (
                      <div className="flex -space-x-2 mr-2">
                        {trip.participants.slice(0, 3).map((participant, index) => (
                          <div key={index} className="h-6 w-6 rounded-full bg-gray-200 border border-white ring-2 ring-white flex items-center justify-center text-xs">
                            {participant.user?.name?.charAt(0) || "U"}
                          </div>
                        ))}
                        {trip.participants.length > 3 && (
                          <div className="h-6 w-6 rounded-full bg-gray-100 border border-white ring-2 ring-white flex items-center justify-center text-xs">
                            +{trip.participants.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <TabNavigation />
        </div>
        
        <div className="flex-1">
          {activeTab === 'profile' && <ProfileContent />}
          {activeTab === 'trips' && <TripsContent />}
          {activeTab === 'favorites' && <FavoritesContent />}
          {activeTab === 'savedEvents' && <SaveEvent />}
        </div>
      </div>
    </div>
  );
}
