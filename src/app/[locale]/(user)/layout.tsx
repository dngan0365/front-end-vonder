'use client';

import React from 'react';
import { AuthRefresher } from '@/components/auth/AuthRefresher';


export default function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <div>
      <AuthRefresher/>
      <main>
        {children}
      </main>
    </div>
  );
}
