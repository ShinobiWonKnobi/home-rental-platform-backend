"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users, Home, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

interface Booking {
  id: number;
  propertyId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  guestName: string;
  guestEmail: string;
  createdAt: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const fetchBookings = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const response = await fetch(`/api/bookings?guestEmail=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError("Failed to load bookings. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => router.push("/")}
            >
              <Home className="h-8 w-8" />
              <h1 className="text-2xl font-bold">HomeStay</h1>
            </div>
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-2">My Bookings</h2>
          <p className="text-muted-foreground mb-8">
            View your past and upcoming reservations
          </p>

          {/* Email Search Form */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && fetchBookings()}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={fetchBookings} disabled={isLoading}>
                  {isLoading ? "Searching..." : "Find Bookings"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="text-center py-4 mb-8">
              <p className="text-destructive bg-destructive/10 p-4 rounded-lg inline-block">
                {error}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Bookings List */}
          {!isLoading && hasSearched && bookings.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any bookings associated with this email address.
                </p>
                <Button onClick={() => router.push("/")}>
                  Browse Properties
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Booking #{booking.id}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        Booked on {formatDate(booking.createdAt)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Check-in:</span>
                          <span>{formatDate(booking.checkIn)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Check-out:</span>
                          <span>{formatDate(booking.checkOut)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Guests:</span>
                          <span>{booking.guests}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Guest Name:</span>
                          <span>{booking.guestName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Email:</span>
                          <span>{booking.guestEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Nights:</span>
                          <span>{calculateNights(booking.checkIn, booking.checkOut)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="text-lg font-bold">
                        Total: ${booking.totalPrice}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/properties/${booking.propertyId}`)}
                      >
                        View Property
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
