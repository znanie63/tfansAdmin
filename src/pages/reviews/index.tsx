import { MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Review } from '@/types';
import { getReviews } from '@/lib/reviews';
import { toast } from 'sonner';
import { ReviewCard } from './components/review-card';

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary/80" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reviews</h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            User feedback and suggestions
          </p>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">average rating</span>
          </div>
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No reviews yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Reviews from users will appear here once they start providing feedback.
          </p>
        </div>
      )}
    </div>
  );
}