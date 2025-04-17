'use client';

import React from 'react';
import Navbar from "@/components/navbar/navbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar/>
      <main>
        {children}
      </main>
    </div>
  );
}