import { Review } from '@/types';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={review.avatar} alt={review.username} />
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium leading-none mb-1">
              {review.username}
            </h3>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/25"
                  )}
                />
              ))}
            </div>
          </div>
          <time className="text-xs text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString()}
          </time>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {review.text}
        </p>
      </CardContent>
    </Card>
  );
}