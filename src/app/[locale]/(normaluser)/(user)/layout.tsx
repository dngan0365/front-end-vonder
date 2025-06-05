'use client';
import { AuthRedirect } from "@/components/auth/AuthRedirect";

import React from 'react';
import { AuthRefresher } from '@/components/auth/AuthRefresher';
import { AuthProvider } from "@/context/AuthContext";

export default function UserLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
        <AuthRedirect/>
        <AuthRefresher />
        <div>{children}</div>
    </AuthProvider>
  );
}
