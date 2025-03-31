'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function AuthRedirect() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until authentication check is completed
    if (loading) return;

    if (isAuthenticated && user) {
      // User is logged in, redirect based on role
      if (user.role === 'ADMIN') {
        router.push('/admin/location');
      } else {
        router.push('/');
      }
    } else {
        router.push('/auth/login');
    }
  }, [isAuthenticated, user, loading, router]);

  return null;
}

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user && user.role !== 'ADMIN'))) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading || !isAuthenticated || (user && user.role !== 'ADMIN')) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return <>{children}</>;
}