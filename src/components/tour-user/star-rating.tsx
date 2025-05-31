import { FC } from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  className?: string;
  size?: number;
}

export const StarRating: FC<StarRatingProps> = ({ 
  rating, 
  className = '',
  size = 16
}) => {
  // Round to nearest half
  const roundedRating = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(roundedRating);
  const halfStar = roundedRating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star 
          key={`full-${i}`} 
          className="text-yellow-400 fill-yellow-400" 
          size={size}
        />
      ))}
      
      {halfStar && (
        <StarHalf 
          className="text-yellow-400 fill-yellow-400" 
          size={size}
        />
      )}
      
      {[...Array(emptyStars)].map((_, i) => (
        <Star 
          key={`empty-${i}`} 
          className="text-gray-300" 
          size={size}
        />
      ))}
      
      <span className="ml-1 text-sm font-medium">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};
