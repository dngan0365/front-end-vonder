'use client';

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
        <AuthRefresher />
        <main>{children}</main>
    </AuthProvider>
  );
}
