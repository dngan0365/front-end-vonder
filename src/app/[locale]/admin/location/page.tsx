'use client';

import { useTranslations } from 'next-intl';

export default function AdminLocations() {
  const t = useTranslations('Admin');
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('locationManagement') || 'Location Management'}</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">This is the location management page. Here you can manage all tour locations.</p>
        {/* Add your location management UI here */}
      </div>
    </div>
  );
}
