"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Home, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Star,
  MessageSquare,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Property, Booking, Review, Transaction } from "@/types";

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = 2; // Demo host user

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propsRes, bookingsRes, reviewsRes, transRes] = await Promise.all([
        fetch("/api/properties"),
        fetch("/api/bookings"),
        fetch("/api/reviews"),
        fetch(`/api/transactions?userId=${userId}`),
      ]);

      if (propsRes.ok) setProperties(await propsRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (reviewsRes.ok) setReviews(await reviewsRes.json());
      if (transRes.ok) setTransactions(await transRes.json());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalRevenue = transactions
    .filter((t) => t.status === "completed")
    .reduce((acc, t) => acc + t.amount, 0);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.checkIn) > new Date() && b.status !== "cancelled"
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Host Dashboard</h1>
            </Link>
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(totalRevenue / 100).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{properties.length}</div>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingBookings.length}</div>
              <p className="text-xs text-muted-foreground">Upcoming stays</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                From {reviews.length} reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.slice(0, 5).map((booking) => {
                  const property = properties.find((p) => p.id === booking.propertyId);
                  return (
                    <div key={booking.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{booking.guestName}</p>
                        <p className="text-sm text-muted-foreground">
                          {property?.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                          {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{booking.status || "confirmed"}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{review.user?.name || "Guest"}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-auto py-6" variant="outline" asChild>
            <Link href="/messages">
              <MessageSquare className="h-5 w-5 mr-2" />
              View Messages
            </Link>
          </Button>
          <Button className="h-auto py-6" variant="outline" asChild>
            <Link href="/bookings">
              <Calendar className="h-5 w-5 mr-2" />
              Manage Bookings
            </Link>
          </Button>
          <Button className="h-auto py-6" variant="outline" asChild>
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              View Properties
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
