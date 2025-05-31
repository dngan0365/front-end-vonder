import { FC } from 'react';
import { TourReview } from '@/api/tourReview';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/tour-user/star-rating';
import { formatDistanceToNow } from 'date-fns';

interface TourReviewsProps {
  reviews: TourReview[];
}

export const TourReviews: FC<TourReviewsProps> = ({ reviews }) => {
  console.log('Rendering TourReviews with', reviews);
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews yet. Be the first to leave a review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={review.user.image || ''} alt={review.user.name || 'User'} />
                <AvatarFallback>
                  {review.user.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold">{review.user.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <StarRating rating={review.rating} className="mb-2" />
                {review.comment && <p className="text-sm">{review.comment}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
