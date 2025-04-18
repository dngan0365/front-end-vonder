'use client'
// pages/index.tsx
import Head from 'next/head';
import Image from 'next/image';
import styles from './cardRegion.module.css';
import { useState } from 'react';

interface Destination {
  id: number;
  region: string;
  image: string;
  description: string;
  alt: string;
  buttonColor: string;
}

export default function cardRegion() {
  const destinations: Destination[] = [
    {
      id: 1,
      region: "Northern Vietnam",
      image: "/scenery/region-1.png",
      description: "Breathtaking landscapes, cultural heritage, and a blend of modern and traditional charm.",
      alt: "Hoan Kiem Lake in Hanoi, Northern Vietnam",
      buttonColor: "text-gray-800"
    },
    {
      id: 2,
      region: "Central Vietnam",
      image: "/scenery/region-2.png",
      description: "Stunning beaches, ancient towns, and rich imperial history.",
      alt: "Hoi An Ancient Town at sunset, Central Vietnam",
      buttonColor: "text-cyan-400"
    },
    {
      id: 3,
      region: "Southern Vietnam",
      image: "/scenery/region-3.png",
      description: "Bustling cities, lush Mekong Delta, and historic wartime sites.",
      alt: "Ho Chi Minh statue and City Hall in Ho Chi Minh City, Southern Vietnam",
      buttonColor: "text-gray-800"
    }
  ];

    const [activeRegion, setActiveRegion] = useState(null);
    
    const regions = {
        northern: {
        name: 'Northern',
        cities: ['Ha Noi', 'Ha Giang', 'Ha Long', 'Mai Chau', 'Ninh Binh', 'Sapa'],
        description: 'Rugged mountains, ancient villages, and the iconic Ha Long Bay create a landscape of mystery and majesty. The cool climate and rich history add depth to the stunning scenery.'
        },
        central: {
        name: 'Central',
        cities: ['Da Nang', 'Da Lat', 'Hoi An', 'Hue', 'Nha Trang', 'Phong Nha'],
        description: 'Dazzles with its golden beaches, royal citadels, and lush highlands, offering a perfect blend of history, culture, and natural beauty.'
        },
        southern: {
        name: 'Southern',
        cities: ['Con Dao', 'Binh Thuan', 'Can Tho', 'Chau Doc', 'Phu Quoc'],
        description: 'Bursts with life, from the dynamic streets of Ho Chi Minh City to the endless rivers and floating markets of the Mekong Delta.'
        }
    };

    const handleRegionHover = (region) => {
        setActiveRegion(region);
    };


  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Vietnam&apos;s Must-Visit Attractions</title>
        <meta name="description" content="Discover beautiful destinations across Vietnam" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-cyan-400 mb-12">
          Vietnam&apos;s Must-Visit Attractions
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <div 
              key={destination.id} 
              className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative h-60 w-full">
                <Image
                  src={destination.image}
                  alt={destination.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                  className={styles.cardImage}
                />
              </div>
              <div className="p-6 flex flex-col items-center text-center">
                <h2 className="text-2xl font-semibold mb-3">{destination.region}</h2>
                <p className="text-gray-600 mb-6">{destination.description}</p>
                <a 
                  href="#" 
                  className={`${destination.buttonColor} font-medium hover:underline`}
                >
                  Explore
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Map Section */}
        <div className="container mx-auto px-4 max-w-6xl py-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="relative w-[500px] h-[900px]">
        {/* Background map */}
        <Image
            src="/icon/map.svg"
            alt="Vietnam Map"
            width={500}
            height={900}
            className="rounded-lg"
        />

        {/* Northern Region Icon */}
        <div
            className="absolute top-[5%] left-[20%] cursor-pointer"
            onMouseEnter={() => handleRegionHover('northern')}
            onMouseLeave={() => handleRegionHover(null)}
        >
            {/* <Image
            src="/icon/north.svg"
            alt="Northern Region"
            width={200}
            height={200}
            className="border-2 border-cyan-400 rounded-full p-1 bg-white"
            /> */}
        </div>

        {/* Central Region Icon */}
        <div
            className="absolute top-[45%] left-[35%] cursor-pointer"
            onMouseEnter={() => handleRegionHover('central')}
            onMouseLeave={() => handleRegionHover(null)}
        >
            {/* <Image
            src="/icon/central.svg"
            alt="Central Region"
            width={50}
            height={50}
            /> */}
        </div>

        {/* Southern Region Icon */}
        <div
            className="absolute top-[70%] left-[30%] cursor-pointer"
            onMouseEnter={() => handleRegionHover('southern')}
            onMouseLeave={() => handleRegionHover(null)}
        >
            {/* <Image
            src="/icon/south.svg"
            alt="Southern Region"
            width={50}
            height={50}
            /> */}
        </div>
        </div>

        
        <div className="flex flex-col justify-center">
        <h1 className="text-4xl font-bold text-center text-cyan-500 mb-10">Explore Vietnam with 3 regions</h1>
          <p className="text-lg mb-6">
            Vietnam unfolds like a living painting across its three regions, each with its own unique beauty. Together, they weave a breathtaking story of nature, culture, and adventure.
          </p>
          
          {Object.keys(regions).map((regionKey) => (
            <div 
              key={regionKey}
              className={`mb-6 ${activeRegion === regionKey ? 'opacity-100' : 'opacity-80'} transition-opacity duration-300`}
            >
              <h2 className={`text-2xl font-bold mb-2 ${styles[regionKey]}`}>
                {regions[regionKey].name}
                <span className="block w-16 h-1 mt-1 bg-cyan-400"></span>
              </h2>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                {regions[regionKey].cities.map((city) => (
                  <div key={city} className="text-sm">
                    {city}
                  </div>
                ))}
              </div>
              
              {activeRegion === regionKey && (
                <p className="text-base mt-2 animate-fadeIn">
                  {regions[regionKey].description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
      </main>

    </div>
  );
}