'use client';

import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef } from "react";

export function AuthRefresher() {
  const { user, refreshUser } = useAuth();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    // Function to handle user refresh
    const handleRefresh = async () => {
      if (!hasRefreshed.current) {
        const refreshedUser = await refreshUser();
        console.log("AuthRefresher: User refreshed", refreshedUser);
        hasRefreshed.current = true;
      }
    };
    
    handleRefresh();
  }, [refreshUser]); // Include refreshUser in dependencies

  return null; // This component doesn't render anything
}