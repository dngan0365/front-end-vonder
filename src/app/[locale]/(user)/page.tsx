<<<<<<< HEAD
"use client";
import { useEffect, useState } from 'react';
import { getAllLocations, Location } from '@/api/location';
import LocationItem from '@/components/LocationItem';

export default function Home({ params }: { params: { locale: string } }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch locations from the API or state management
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const data = await getAllLocations();
        console.log("Fetched data:", data);
        
        if (Array.isArray(data) && data.length > 0) {
          setLocations(data);
        } else {
          console.warn("Data is not in expected format:", data);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setError('Failed to load locations');
=======

"use client";
import {useTranslations} from 'next-intl';
import { useEffect, useState } from 'react';
import { getAllLocations, Location } from '@/api/location';
import LocationItem from '@/components/LocationItem';
import { useFavorites } from '@/hooks/useFavorite';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const t = useTranslations('HomePage');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {favorites} = useFavorites();
  const {refreshUser} = useAuth();

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
>>>>>>> a5c877a92c572eba7f5a564795b882fd4b0e2073
      } finally {
        setLoading(false);
      }
    };
    
<<<<<<< HEAD
    fetchLocations();
  }, []); 
=======
    fetchData();
  }, []);
>>>>>>> a5c877a92c572eba7f5a564795b882fd4b0e2073

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h2 className="text-xl font-semibold mb-6">
<<<<<<< HEAD
        Explore Location
=======
        {t('exploreDestinations')}
>>>>>>> a5c877a92c572eba7f5a564795b882fd4b0e2073
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
<<<<<<< HEAD
            <LocationItem key={location.id} location={location} />
=======
            <LocationItem 
              key={location.id} 
              location={location} 
              isFavorite={favorites.some(fav => fav.id === location.id)} 
            />
>>>>>>> a5c877a92c572eba7f5a564795b882fd4b0e2073
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-gray-800">No locations found</h3>
        </div>
<<<<<<< HEAD
      )}
    </div>
  );
=======
      )
  }
    </div>
  );

>>>>>>> a5c877a92c572eba7f5a564795b882fd4b0e2073
}