import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Location } from '../api/location';

interface LocationItemProps {
  location: Location;
}

const LocationItem: React.FC<LocationItemProps> = ({ location }) => {
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
        
        {/* Content */}
        <div className="absolute bottom-0 w-full p-4 text-white">
          <h3 className="text-xl font-semibold">{location.name}</h3>
          <div className="mt-1 flex items-center text-sm">
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
