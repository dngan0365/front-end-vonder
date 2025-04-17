'use client';

import React from 'react';
import Navbar from "@/components/navbar/navbar";

export default function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <div>
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
}
