import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Location } from '../api/location';
import { FaHeart, FaMapMarkerAlt, FaStar } from 'react-icons/fa';

interface LocationItemProps {
  location: Location;
  isFavorite?: boolean;
}

const LocationItem: React.FC<LocationItemProps> = ({ location, isFavorite = false }) => {
  return (
    <Link href={`/locations/${location.id}`} className="block">
      <div className="group relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg ring-1 ring-gray-200/50 transition-all duration-500 hover:shadow-2xl hover:ring-gray-300/30 hover:-translate-y-1">
        {/* Image container with gradient overlay */}
        <div className="relative h-56 w-full overflow-hidden rounded-t-2xl">
          <Image
            src={location.coverImage}
            alt={location.name}
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
            width={400}
            height={300}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          
          {/* Favorite heart icon with animated pulse */}
          {isFavorite && (
            <div className="absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2.5 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:scale-110">
              <FaHeart className="text-lg text-red-500 drop-shadow-sm animate-pulse" />
            </div>
          )}
          
          {/* Category badge with glassmorphism effect */}
          <div className="absolute bottom-4 right-4">
            <span className="inline-flex items-center rounded-xl bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-75"></span>
              {location.category}
            </span>
          </div>

          {/* Rating stars (if available) */}
          {location.rating && (
            <div className="absolute top-4 left-4 flex items-center space-x-1 rounded-lg bg-white/90 px-2 py-1 backdrop-blur-sm">
              <FaStar className="text-yellow-400 text-xs" />
              <span className="text-xs font-medium text-gray-800">{location.rating}</span>
            </div>
          )}
        </div>
        
        {/* Card content with enhanced typography */}
        <div className="flex flex-grow flex-col p-6">
          {/* Title with better typography */}
          <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-cyan-500 transition-colors duration-300 line-clamp-1">
            {location.name}
          </h3>
          
          {/* Location with improved styling */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <div className="flex items-center justify-center w-8 h-8 bg-red-50 rounded-full mr-3">
              <FaMapMarkerAlt className="text-red-500 text-xs" />
            </div>
            <span className="font-medium">{location.province}</span>
          </div>
          
          {/* HTML description with proper rendering */}
          {location.description && (
            <div 
              className="text-sm text-gray-600 leading-relaxed line-clamp-2"
              dangerouslySetInnerHTML={{ 
                __html: location.description 
              }}
            />
          )}
          
          {/* Fallback description if no HTML description */}
          {!location.description && (
            <div className="text-sm text-gray-500 leading-relaxed line-clamp-3">
              Explore this beautiful destination in {location.province}
            </div>
          )}
          
          {/* Additional info section */}
          <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {location.price && (
                <span className="text-sm font-semibold text-blue-600">
                  From ${location.price}
                </span>
              )}
            </div>
            
          </div>
        </div>
        
      </div>
    </Link>
  );
};

export default LocationItem;