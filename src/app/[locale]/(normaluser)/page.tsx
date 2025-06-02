'use client';

import { useEffect, useState } from 'react';
import { getAllLocations, Location } from '@/api/location';

// import component
import CardRegion from '@/components/cardRegion/cardRegion';
import LocationItem from '@/components/LocationItem';
import EventList from '@/components/eventlist/eventlist';
import Feature from '@/components/feature/feature'
import MustSeeSites from '@/components/tour/tour';
import TravelTips from '@/components/travelTips/travelTips';
import Footer from "@/components/footer/footer";
import Link from 'next/link';
import Image from 'next/image'

export default function HomePage() {
  // File locations
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch locations from the API or state management
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await getAllLocations({ limit: 20 });
        console.log("Fetched response:", response);
        
        // Extract the data array from the paginated response
        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
          setLocations(response.data);
        } else {
          console.warn("No locations found in response:", response);
          setLocations([]); // Set empty array instead of keeping loading state
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setError('Failed to load locations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocations();
  }, []); 

  return (
    <>
      {/* Hero Section with Background Image */}
      <div className="relative w-full h-[80vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/vietnam-thumb.jpg"
            alt="Vietnam Hero Background"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-white/40"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-start h-full px-8 sm:px-16 lg:px-24">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Explore
              <span className="block text-cyan-400">Vietnam</span>
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-gray-200 leading-relaxed">
              Discover the beauty, culture, and adventure that awaits in Vietnam. <br />
              From bustling cities to serene landscapes, your journey starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/explore">
              <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300 shadow-lg">
                Start Exploring
              </button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <Feature/>
      <CardRegion/>
      <TravelTips/>
      <MustSeeSites/>
      <EventList/>
      
      {/* Locations Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-cyan-400">
              Explore Locations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover amazing destinations across Vietnam, each with its own unique charm and attractions.
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
              <p className="mt-4 text-gray-600">Loading amazing locations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-red-500 mb-2">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-700 font-medium">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : locations && locations.length > 0 ? (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {locations.map((location) => (
                <div key={location.id} className="transform hover:scale-105 transition-transform duration-300">
                  <LocationItem location={location} />
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
            <Link href="/explore">
              <span className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-300 shadow-md">
                See More Locations
              </span>
            </Link>
          </div>
                      </>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No locations found</h3>
                <p className="text-gray-500">Check back soon for amazing destinations!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer/>
    </>
  );
}