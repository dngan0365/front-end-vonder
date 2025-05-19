'use client'
import React from 'react';
import CategoriesSidebar from '@/components/sidebar/CategoriesSidebar';

export default function ExploreLayout({children,}: {children: React.ReactNode;}) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar - will be present on all category pages */}
        <CategoriesSidebar activeCategory="natural" />
        {/* Main Content - will be different for each page */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}