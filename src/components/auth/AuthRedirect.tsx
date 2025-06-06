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
    console.log("pathname", pathname);
    if (loading) return;

    // Extract path without locale for consistent checks (e.g., /en/auth/login -> /auth/login)
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, '/');
    
    // Avoid redirecting if user is already on auth pages
    if (!isAuthenticated && (pathname.includes('/auth/') || pathWithoutLocale.startsWith('/auth/'))) return;

    // For authenticated users, only redirect if they're on login/register pages or root
    if (isAuthenticated && user) {
      if (pathname === '/' || pathname.endsWith('/') || 
          pathname.includes('/auth/') || pathWithoutLocale.startsWith('/auth/')) {
        if (user.role === 'ADMIN') {
          router.push('/admin/location');
        } else if (user.role === 'agency') {
          router.push('/agency/tours');
        } else {
          router.push('/');
        }
      }
    } else if (!pathname.includes('/auth/') && !pathWithoutLocale.startsWith('/auth/')) {
      // Only redirect unauthenticated users if they're not on any auth pages
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