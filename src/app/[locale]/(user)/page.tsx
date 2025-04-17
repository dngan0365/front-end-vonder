"use client";
import {useTranslations} from 'next-intl';
import { useEffect, useState } from 'react';
import { getAllLocations, Location } from '@/api/location';
import LocationItem from '@/components/LocationItem';
import { useFavorites } from '@/hooks/useFavorite';

export default function Home() {
  const t = useTranslations('HomePage');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {favorites} = useFavorites();

  useEffect(() => {
    // Fetch locations and favorites
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch locations
        const locationsData = await getAllLocations();
        
        if (Array.isArray(locationsData) && locationsData.length > 0) {
          setLocations(locationsData);
        } else {
        }
              
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h2 className="text-xl font-semibold mb-6">
        {t('exploreDestinations')}
      </h2>
      
      {loading ? (
        <div className="text-center py-10">
          <p>Loading locations...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 py-10">
          {error}
        </div>
      ) : locations && locations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {locations.map((location) => (
            <LocationItem 
              key={location.id} 
              location={location} 
              isFavorite={favorites.some(fav => fav.id === location.id)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-gray-800">No locations found</h3>
        </div>
      )
  }
    </div>
  );

}