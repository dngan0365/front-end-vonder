'use client';
import { AuthRedirect } from "@/components/auth/AuthRedirect";

import React from 'react';
import { AuthRefresher } from '@/components/auth/AuthRefresher';
import { AuthProvider } from "@/context/AuthContext";

export default function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <AuthProvider>
        <AuthRedirect/>
        <AuthRefresher />
        <main>{children}</main>
    </AuthProvider>
  );
}
