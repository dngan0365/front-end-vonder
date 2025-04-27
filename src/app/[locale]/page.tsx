'use client';

import { useEffect, useRef, useState } from 'react';
import { getAllLocations, Location } from '@/api/location';

// import component
import CardRegion from '../../components/cardRegion/cardRegion';
import LocationItem from '@/components/LocationItem';
import EvenList from '@/components/eventlist/eventlist';
import Feature from '@/components/feature/feature'
import MustSeeSites from '@/components/tour/tour';
import TravelTips from '@/components/travelTips/travelTips';
import Footer from "@/components/footer/footer";

export default function HomePage() {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Load the YouTube Iframe API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player('youtube-player', {
        videoId: 'R3jtth1dfg4', // Your Video ID
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: 'R3jtth1dfg4',
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          disablekb: 1, // disable keyboard controls
        },
        events: {
          onReady: (event: any) => {
            // Set the playback speed to 1.25
            event.target.setPlaybackRate(1.25);
          },
        },
      });
    };

    const handleScroll = () => {
      if (playerRef.current && playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // File locations
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
        } finally {
          setLoading(false);
        }
      };
      
      fetchLocations();
    }, []); 

  return (
    <>
      <div className="relative w-full h-[80vh] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full scale-[1.4]">
          <div id="youtube-player" className="w-full h-full" />
        </div>
      </div>

    <Feature/>
    <CardRegion/>
    <TravelTips/>
    <MustSeeSites/>
    <EvenList/>
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h2 className="text-xl font-semibold mb-6">
        Explore Location
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
            <LocationItem key={location.id} location={location} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-gray-800">No locations found</h3>
        </div>
      )}
    </div>

    <Footer/>
    </>
  );
}
