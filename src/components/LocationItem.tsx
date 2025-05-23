import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Location } from '../api/location';
import { FaHeart, FaMapMarkerAlt } from 'react-icons/fa';

interface LocationItemProps {
  location: Location;
  isFavorite?: boolean;
}

const LocationItem: React.FC<LocationItemProps> = ({ location, isFavorite = false }) => {
  return (
    <Link href={`/locations/${location.id}`} className="block">
      <div className="group flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl">
        {/* Image container */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={location.coverImage}
            alt={location.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            width={400}
            height={300}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          
          {/* Favorite heart icon */}
          {isFavorite && (
            <div className="absolute top-3 right-3 z-10 rounded-full bg-white/20 p-2 backdrop-blur-sm">
              <FaHeart className="text-lg text-red-500 drop-shadow" />
            </div>
          )}
          
          {/* Category badge */}
          <div className="absolute bottom-3 right-3">
            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {location.category}
            </span>
          </div>
        </div>
        
        {/* Card content below the image */}
        <div className="flex flex-grow flex-col p-4">
          <h3 className="text-lg font-bold text-gray-800">{location.name}</h3>
          
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <FaMapMarkerAlt className="mr-1 text-red-500" />
            <span>{location.province}</span>
          </div>
          
          {/* You can add more details here if needed */}
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
            {location.description || "Explore this beautiful destination in " + location.province}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default LocationItem;