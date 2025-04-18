'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Navbar from "../../components/navbar/navbar";
import Footer from "@/components/footer/footer";
import CardRegion from '../../components/cardRegion/cardRegion';
import TravelTips from '@/components/travelTips/travelTips';
import MustSeeSites from '@/components/tour/tour';
import EvenList from '@/components/eventlist/eventlist';

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

  const testimonials = [
    {
      id: 1,
      imageUrl: '/scenery/feature-1.jpg',
      alt: 'Female student with glasses',
      className: 'col-span-2 row-span-2', // Big highlight image
    },
    {
      id: 2,
      imageUrl: '/scenery/feature-3.jpg',
      alt: 'Professional woman in suit',
      className: 'col-span-1 row-span-1', // Small top right
    },
    {
      id: 3,
      imageUrl: '/scenery/feature-2.jpg',
      alt: 'Male student with red jacket',
      className: 'col-span-1 row-span-2', // Tall left image
    },
    {
      id: 4,
      imageUrl: '/scenery/feature-5.jpg',
      alt: 'Smiling woman with short hair',
      className: 'col-span-2 row-span-2', // Another highlight, bottom center
    },

  ];


  return (
    <>
      <Navbar />

      {/* 🔥 FIX: Give real height to container (example 2/3 viewport) */}
      <div className="relative w-full h-[80vh] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full scale-[1.4]">
          <div id="youtube-player" className="w-full h-full" />
        </div>
      </div>

      <section className="w-full bg-white py-16 px-4 md:px-4 lg:px-16">
      <div className="mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Left Text Column */}
          <div className="md:pr-4 col-span-1">
            <h2 className="text-2xl text-[#4ad4e4] md:text-5xl lg:text-6xl font-bold text-navy-900 mb-6">
            Live fully in Vietnam
            </h2>
            <p className="text-gray-700 mb-8 text-sm">
            Vietnam opens its door widely to welcome visitors all around the world! Starting from 15th August 2023, Vietnam extends e-visa validity to 90 days and unilateral visa exemption will be valid in 45 days! </p>
            <p className="text-gray-700 mb-8 text-sm">
            We are more than happy to welcome you all here and admire our stunning landscapes, free your soul on white sandy beaches, experience our unique and beautiful culture and meet the people in the most friendly country. Particularly, to indulge in our scrumptious cuisine at Michelin rated restaurants or to join us in outstanding mega culture, music, sports and tourism events!</p>
            <div className="flex justify-center">
            <button className="bg-[#4ad4e4] hover:bg-[#77DAE6] text-white font-medium py-3 px-6 rounded transition duration-300">
              Let's Explore
            </button>
  </div>
          </div>

          {/* Right */}
            <div className="grid grid-cols-3 grid-rows-3 gap-2 md:gap-4 h-[80vh] w-[60vw]">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id} 
                className={`relative overflow-hidden rounded-lg ${testimonial.className}`}
              >
                <div className="relative w-full h-full pb-[100%] md:pb-0 md:h-full">
                  <Image
                    src={testimonial.imageUrl}
                    alt={testimonial.alt}
                    fill
                    style={{ objectFit: 'cover', maxWidth: '100%', maxHeight: '100%' }} // ✅ Corrected
                    className="rounded-lg"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    <CardRegion/>
    <TravelTips/>
    <MustSeeSites/>
    <EvenList/>
    <Footer/>
    </>
  );
}
