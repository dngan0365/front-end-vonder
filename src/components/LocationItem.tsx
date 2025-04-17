import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Location } from '../api/location';
import { FaHeart } from 'react-icons/fa'; // Import heart icon

interface LocationItemProps {
  location: Location;
  isFavorite?: boolean; // Add new prop
}

const LocationItem: React.FC<LocationItemProps> = ({ location, isFavorite = false }) => {
  return (
    <Link href={`/locations/${location.id}`}>
      <div className="relative h-64 w-full overflow-hidden rounded-lg shadow-md transition-transform hover:scale-105 hover:shadow-lg">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={location.coverImage}
            alt={location.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
        
        {/* Favorite heart icon */}
        {isFavorite && (
          <div className="bg-black/50 p-2 absolute top-3 rounded-2xl right-3 z-10">
            <FaHeart className="text-red-500 text-2xl drop-shadow-lg" />
          </div>
        )}
        
        {/* Content */}
        <div className="absolute bottom-0 w-full p-4 text-white backdrop-blur-md bg-black/20 rounded-t-lg">
          <h3 className="text-xl font-bold drop-shadow-lg">{location.name}</h3>
          <div className="mt-2 flex items-center text-sm drop-shadow-lg">
            <span>{location.province}</span>
            <span className="mx-2">•</span>
            <span>{location.category}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LocationItem;
