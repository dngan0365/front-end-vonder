'use client';

import React from 'react';
import Navbar from "@/components/navbar/navbar";
import { useParams } from 'next/navigation';
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
      <Navbar locale={locale} />
      <main>
        {children}
      </main>
    </div>
  );
}
