'use client';

import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { createTourReview, updateTourReview } from '@/api/tourReview';
import { useAuth } from '@/hooks/useAuth';
import { TourReview } from '@/api/tourReview';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ReviewFormProps {
  tourId: string;
  existingReview?: TourReview;
  onReviewSubmitted: () => void;
}

export const ReviewForm: FC<ReviewFormProps> = ({ 
  tourId, 
  existingReview, 
  onReviewSubmitted 
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }
    
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (existingReview) {
        await updateTourReview(existingReview.id, user.id, {
          rating,
          comment: comment.trim() || undefined
        });
        toast.success("Your review has been updated successfully");
      } else {
        await createTourReview(user.id, {
          tourId,
          rating,
          comment: comment.trim() || undefined
        });
        toast.success("Your review has been submitted successfully");
      }
      
      onReviewSubmitted();
      
      if (!existingReview) {
        setRating(0);
        setComment('');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error("Failed to submit your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Please sign in to leave a review</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="rating" className="font-medium">
          Rating
        </label>
        <div 
          className="flex" 
          onMouseLeave={() => setIsHovering(false)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={24}
              className={`cursor-pointer ${
                (isHovering ? hoverRating >= star : rating >= star)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => {
                setIsHovering(true);
                setHoverRating(star);
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="flex flex-col space-y-2">
        <label htmlFor="comment" className="font-medium">
          Comments (optional)
        </label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this tour..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting || rating === 0}>
        {isSubmitting 
          ? 'Submitting...' 
          : existingReview 
            ? 'Update Review' 
            : 'Submit Review'
        }
      </Button>
    </form>
  );
};
