'use client';

import React from 'react';
import Navbar from "@/components/navbar/navbar";
import { useParams } from 'next/navigation';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const locale = params.locale as string;
  
  return (
    <div>
      <Navbar locale={locale} />
      <main>
        {children}
      </main>
    </div>
  );
}