'use client';

import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef } from "react";

export function AuthRefresher() {
  const { refreshUser } = useAuth();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    // Only refresh once when component mounts
    if (!hasRefreshed.current) {
      refreshUser();
      hasRefreshed.current = true;
    }
    // No dependencies array means this only runs once on mount
  }, []);

  return null; // This component doesn't render anything
}
