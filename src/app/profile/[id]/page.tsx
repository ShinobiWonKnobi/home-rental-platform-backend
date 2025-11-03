"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Home, MapPin, Mail, Phone, Star, Shield, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { User, HostProfile, Review } from "@/types";

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const [userRes, profileRes, reviewsRes] = await Promise.all([
        fetch(`/api/users/${id}`),
        fetch(`/api/host-profiles?userId=${id}`),
        fetch(`/api/reviews?userId=${id}`),
      ]);

      if (userRes.ok) setUser(await userRes.json());
      if (profileRes.ok) setHostProfile(await profileRes.json());
      if (reviewsRes.ok) setReviews(await reviewsRes.json());
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-8" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-8 w-8" />
            <h1 className="text-2xl font-bold">HomeStay</h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-4xl">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{user.userType}</Badge>
                        {user.isVerified && (
                          <Badge className="bg-blue-500">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {hostProfile?.superhostStatus && (
                          <Badge className="bg-purple-500">
                            <Star className="h-3 w-3 mr-1" />
                            Superhost
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(user.joinedAt).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Button>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>

                  {user.bio && (
                    <p className="text-muted-foreground mb-4">{user.bio}</p>
                  )}

                  <div className="space-y-2">
                    {user.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {hostProfile && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Host Information</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Properties</p>
                    <p className="text-2xl font-bold">{hostProfile.propertyCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reviews</p>
                    <p className="text-2xl font-bold">{hostProfile.totalReviews}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      <p className="text-2xl font-bold">{hostProfile.averageRating.toFixed(1)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Response Rate</p>
                    <p className="text-2xl font-bold">{hostProfile.responseRate}%</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold mb-1">Response Time</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {hostProfile.responseTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {hostProfile.languages.map((lang) => (
                        <Badge key={lang} variant="secondary">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {reviews.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  Reviews ({reviews.length})
                </h2>
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">Property Review</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-semibold">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
