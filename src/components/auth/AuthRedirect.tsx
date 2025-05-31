'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function AuthRedirect() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until authentication check is completed
    if (loading) return;

    // Avoid redirecting if user is already on auth pages
    if (!isAuthenticated && pathname.startsWith('/auth/')) return;

    // For authenticated users, only redirect if they're on login/register pages or root
    if (isAuthenticated && user) {
      if (pathname === '/' || pathname.startsWith('/auth/')) {
        if (user.role === 'ADMIN') {
          router.push('/admin/location');
        } else if (user.role === 'agency') {
          router.push('/agency/dashboard');
        } else {
          router.push('/');
        }
      }
    } else if (pathname !== '/auth/login' && pathname !== '/auth/register') {
      // Only redirect unauthenticated users if they're not already on auth pages
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, loading, router, pathname]);

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