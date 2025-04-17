"use client"

import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/hooks/useFavorite";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage({ params }: { params: Promise<{ locale: string }> | { locale: string } }) {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { favorites, loading: favoritesLoading, error: favoritesError, removeFavorite, refreshFavorites } = useFavorites();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const hasLoggedFavoritesInfo = useRef(false);

  let profileText, accountDetailsText, logoutText, authRequiredText, pleaseLoginText, goToLoginText, favoritesText, noFavoritesText, removeFavoriteText, viewDetailsText, loadingFavoritesText, errorLoadingFavoritesText;

  try {
    const t = useTranslations("Profile");
    profileText = t("userProfile");
    accountDetailsText = t("accountDetails");
    logoutText = t("logout");
    authRequiredText = t("authRequired");
    pleaseLoginText = t("pleaseLogin");
    goToLoginText = t("goToLogin");
    favoritesText = t("favorites");
    noFavoritesText = t("noFavorites");
    removeFavoriteText = t("removeFavorite");
    viewDetailsText = t("viewDetails");
    loadingFavoritesText = t("loadingFavorites");
    errorLoadingFavoritesText = t("errorLoadingFavorites");
  } catch (e) {
    console.error("Translation error:", e);
    profileText = "User Profile";
    accountDetailsText = "Account Details";
    logoutText = "Log Out";
    authRequiredText = "Authentication Required";
    pleaseLoginText = "Please log in to view your profile";
    goToLoginText = "Go to Login";
    favoritesText = "My Favorite Locations";
    noFavoritesText = "You haven't added any locations to your favorites yet";
    removeFavoriteText = "Remove";
    viewDetailsText = "View Details";
    loadingFavoritesText = "Loading your favorite locations...";
    errorLoadingFavoritesText = "Error loading favorites";
  }

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && isAuthenticated && user) {
      refreshFavorites();
    }
  }, [isAuthenticated, user, isClient]);

  useEffect(() => {
    if (isClient && !loading && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      router.push(`/auth/login`);
    }
  }, [isAuthenticated, loading, router, isClient]);

  const handleLogout = () => {
    logout();
    router.push(`/`);
  };

  useEffect(() => {
    if (isClient && !hasLoggedFavoritesInfo.current) {
      console.log("Auth Status:", { isAuthenticated, loading, user });
      console.log("Favorites:", { favorites, favoritesLoading, favoritesError });
      if (!favoritesLoading) {
        hasLoggedFavoritesInfo.current = true;
      }
    }
  }, [isAuthenticated, loading, user, isClient, favorites, favoritesLoading, favoritesError]);

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
        <h2 className="text-xl font-bold mb-4">{authRequiredText}</h2>
        <p className="mb-4">{pleaseLoginText}</p>
        <button
          onClick={() => router.push(`/auth/login`)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {goToLoginText}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
            {profileText}
          </div>

          <div className="mt-6">
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold mb-2">
                {accountDetailsText}
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
                {logoutText}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12">
        <h2 className="text-2xl font-bold mb-6">{favoritesText}</h2>

        {favoritesLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mr-3"></div>
            <p>{loadingFavoritesText}</p>
          </div>
        ) : favoritesError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{errorLoadingFavoritesText}</p>
            <p className="mt-2">Error details: {String(favoritesError)}</p>
          </div>
        ) : !favorites || favorites.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-gray-600">{noFavoritesText}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        {viewDetailsText} →
                      </span>
                    </Link>
                    <button
                      onClick={() => removeFavorite(location)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {removeFavoriteText}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
