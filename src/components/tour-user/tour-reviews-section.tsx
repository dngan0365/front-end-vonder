'use client';

import { FC, useState, useEffect } from 'react';
import { TourReviews } from './tour-reviews';
import { ReviewForm } from './review-form';
import { getTourReviews, getTourAverageRating, TourReview, TourRating } from '@/api/tourReview';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { StarRating } from './star-rating';
import { Loader2 } from 'lucide-react';

interface TourReviewsSectionProps {
  tourId: string;
}

export const TourReviewsSection: FC<TourReviewsSectionProps> = ({ tourId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<TourReview[]>([]);
  const [ratingStats, setRatingStats] = useState<TourRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState<TourReview | undefined>(undefined);
  
  const loadReviews = async () => {
    try {
      setLoading(true);
      const [fetchedReviews, rating] = await Promise.all([
        getTourReviews(tourId),
        getTourAverageRating(tourId)
      ]);
      
      setReviews(fetchedReviews);
      setRatingStats(rating);
      
      // Find if the current user has already reviewed this tour
      if (user) {
        const existingUserReview = fetchedReviews.find(
          review => review.userId === user.id
        );
        setUserReview(existingUserReview);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadReviews();
  }, [tourId, user]);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Reviews</h2>
        {ratingStats && (
          <div className="flex items-center">
            <StarRating rating={ratingStats.averageRating} size={20} />
            <span className="ml-2 text-muted-foreground">
              ({ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue={userReview ? "yourReview" : "allReviews"}>
          <TabsList>
            <TabsTrigger value="allReviews">All Reviews</TabsTrigger>
            <TabsTrigger value="yourReview">
              {userReview ? "Your Review" : "Write a Review"}
            </TabsTrigger>
          </TabsList>
          
          <Separator className="my-4" />
          
          <TabsContent value="allReviews">
            <TourReviews reviews={reviews} />
          </TabsContent>
          
          <TabsContent value="yourReview">
            <ReviewForm
              tourId={tourId}
              existingReview={userReview}
              onReviewSubmitted={loadReviews}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
