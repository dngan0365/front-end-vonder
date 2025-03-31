"use client"

import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage({ params }: { params: { locale: string } }) {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Use a try-catch for translations to handle potential issues
  let profileText, accountDetailsText, logoutText, authRequiredText, pleaseLoginText, goToLoginText;
  
  try {
    const t = useTranslations("Profile");
    profileText = t("userProfile");
    accountDetailsText = t("accountDetails");
    logoutText = t("logout");
    authRequiredText = t("authRequired");
    pleaseLoginText = t("pleaseLogin");
    goToLoginText = t("goToLogin");
  } catch (e) {
    console.error("Translation error:", e);
    // Fallback values
    profileText = "User Profile";
    accountDetailsText = "Account Details";
    logoutText = "Log Out";
    authRequiredText = "Authentication Required";
    pleaseLoginText = "Please log in to view your profile";
    goToLoginText = "Go to Login";
  }
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (isClient && !loading && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      router.push(`/${params.locale}/auth/login`);
    }
  }, [isAuthenticated, loading, router, params.locale, isClient]);
  
  const handleLogout = () => {
    logout();
    router.push(`/${params.locale}/`);
  };
  
  // Debug information
  useEffect(() => {
    if (isClient) {
      console.log("Auth Status:", { isAuthenticated, loading, user });
    }
  }, [isAuthenticated, loading, user, isClient]);
  
  // Show loading state
  if (!isClient || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  // If not authenticated, show a message instead of null
  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <h2 className="text-xl font-bold mb-4">{authRequiredText}</h2>
        <p className="mb-4">{pleaseLoginText}</p>
        <button 
          onClick={() => router.push(`/${params.locale}/auth/login`)}
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
              {/* Add more user details here as needed */}
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
    </div>
  );
}
