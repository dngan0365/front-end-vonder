'use client';

import React from 'react';
import Navbar from "@/components/navbar/navbar";
import { useParams } from 'next/navigation';
import { AuthRefresher } from '@/components/auth/AuthRefresher';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const locale = params.locale as string;
  
  return (
    <div>
      <AuthRefresher/>
      <Navbar locale={locale} />
      <main>
        {children}
      </main>
    </div>
  );
}