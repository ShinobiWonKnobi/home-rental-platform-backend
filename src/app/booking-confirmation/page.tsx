"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, Calendar, Users, Mail, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      router.push("/");
      return;
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [bookingId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Home className="h-8 w-8" />
            <h1 className="text-2xl font-bold">HomeStay</h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8 space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold">Booking Confirmed!</h1>
            <p className="text-lg text-muted-foreground">
              Your reservation has been successfully created. We've sent a confirmation email with all the details.
            </p>
          </div>

          {/* Booking Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Booking ID</p>
                  <p className="text-muted-foreground">{bookingId}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Check-in</p>
                    <p className="text-muted-foreground">See confirmation email</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Check-out</p>
                    <p className="text-muted-foreground">See confirmation email</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Guests</p>
                  <p className="text-muted-foreground">See confirmation email</p>
                </div>
              </div>

              <div className="pt-6 border-t space-y-4">
                <h3 className="font-semibold text-lg">What's Next?</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>Check your email for booking confirmation and property details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>The host will contact you within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Home className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>You'll receive check-in instructions before your arrival</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 justify-center">
            <Button asChild size="lg">
              <Link href="/">Return to Home</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Browse More Properties</Link>
            </Button>
          </div>

          {/* Help Section */}
          <Card className="mt-8 bg-muted/50">
            <CardContent className="py-6">
              <p className="text-center text-sm text-muted-foreground">
                Need help with your booking?{" "}
                <a href="#" className="text-primary hover:underline font-medium">
                  Contact Support
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
