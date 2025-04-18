'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteLocation, getAllLocations } from '@/app/api/location';
import type { Location } from '@/app/api/location';


export default function AdminLocations() {
  const t = useTranslations('Admin');
  const [locations, setLocations] = useState<Location[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Fetch locations from the API or state management
    const fetchLocations = async () => {
      try {
        const data = await getAllLocations();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    
    fetchLocations();
  }, [refreshTrigger]); // Only re-fetch when refreshTrigger changes
  
  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete') || 'Are you sure you want to delete this location?')) {
      deleteLocation(id)
        .then(() => {
          // Update local state and trigger a refresh
          setLocations(locations.filter(location => location.id !== id));
          setRefreshTrigger(prev => prev + 1); // Increment to trigger a refresh
        })
        .catch((error) => {
          console.error('Error deleting location:', error);
          alert(t('deleteError') || 'Error deleting location. Please try again.');
        }
      );
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('locationManagement') || 'Location Management'}</h1>
        <Link 
          href="/admin/location/add-location" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          {t('addLocation') || 'Add Location'}
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name') || 'Name'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('category') || 'Category'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('province') || 'Province'}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.map((location) => (
                <tr key={location.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{location.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{location.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{location.province.replace('_', ' ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/location/${location.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      {t('edit') || 'Edit'}
                    </Link>
                    <button 
                      onClick={() => handleDelete(location.id)} 
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('delete') || 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
              {locations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    {t('noLocations') || 'No locations found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
