"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { Review } from "@/types";

interface ReviewsSectionProps {
  propertyId: number;
}

export function ReviewsSection({ propertyId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?propertyId=${propertyId}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [propertyId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
        <p className="text-muted-foreground">Be the first to review this property!</p>
      </div>
    );
  }

  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  const avgCleanliness = reviews.reduce((acc, r) => acc + r.cleanliness, 0) / reviews.length;
  const avgAccuracy = reviews.reduce((acc, r) => acc + r.accuracy, 0) / reviews.length;
  const avgCheckIn = reviews.reduce((acc, r) => acc + r.checkIn, 0) / reviews.length;
  const avgCommunication = reviews.reduce((acc, r) => acc + r.communication, 0) / reviews.length;
  const avgLocation = reviews.reduce((acc, r) => acc + r.location, 0) / reviews.length;
  const avgValue = reviews.reduce((acc, r) => acc + r.value, 0) / reviews.length;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Star className="h-6 w-6 fill-black" />
          <h3 className="text-2xl font-bold">
            {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <RatingBar label="Cleanliness" rating={avgCleanliness} />
          <RatingBar label="Accuracy" rating={avgAccuracy} />
          <RatingBar label="Check-in" rating={avgCheckIn} />
          <RatingBar label="Communication" rating={avgCommunication} />
          <RatingBar label="Location" rating={avgLocation} />
          <RatingBar label="Value" rating={avgValue} />
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

function RatingBar({ label, rating }: { label: string; rating: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold">{rating.toFixed(1)}</span>
      </div>
      <Progress value={(rating / 5) * 100} className="h-1" />
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [showFullComment, setShowFullComment] = useState(false);
  const commentPreview = review.comment?.slice(0, 200);
  const hasLongComment = review.comment && review.comment.length > 200;

  return (
    <div className="border-b pb-6 last:border-0">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={review.user?.avatar} alt={review.user?.name} />
          <AvatarFallback>{review.user?.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold">{review.user?.name || "Anonymous"}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-black" />
              <span className="font-semibold">{review.rating.toFixed(1)}</span>
            </div>
          </div>

          {review.comment && (
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {showFullComment || !hasLongComment ? review.comment : `${commentPreview}...`}
              </p>
              {hasLongComment && (
                <Button
                  variant="link"
                  className="px-0 h-auto font-semibold"
                  onClick={() => setShowFullComment(!showFullComment)}
                >
                  {showFullComment ? "Show less" : "Show more"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
