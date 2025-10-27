"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users } from "lucide-react";
import { format } from "date-fns";
import type { Property } from "@/types";

interface BookingFormProps {
  property: Property;
}

export function BookingForm({ property }: BookingFormProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const calculateNights = () => {
    if (checkIn && checkOut) {
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 0;
    }
    return 0;
  };

  const nights = calculateNights();
  const totalPrice = nights * property.price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates");
      return;
    }

    if (guests > property.guests) {
      setError(`This property can accommodate up to ${property.guests} guests`);
      return;
    }

    if (!guestName || !guestEmail) {
      setError("Please fill in all guest information");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: property.id,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests,
          guestName,
          guestEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      const booking = await response.json();
      router.push(`/booking-confirmation?id=${booking.id}`);
    } catch (err) {
      setError("Failed to create booking. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">${property.price}</span>
          <span className="text-base font-normal text-muted-foreground">per night</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="checkIn"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, "MMM dd, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="checkOut"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "MMM dd, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => !checkIn || date <= checkIn}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests">Guests</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="guests"
                type="number"
                min="1"
                max={property.guests}
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">Max {property.guests} guests</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestName">Full Name</Label>
            <Input
              id="guestName"
              type="text"
              placeholder="John Doe"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestEmail">Email</Label>
            <Input
              id="guestEmail"
              type="email"
              placeholder="john@example.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              required
            />
          </div>

          {nights > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  ${property.price} × {nights} night{nights > 1 ? "s" : ""}
                </span>
                <span>${property.price * nights}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Processing..." : "Reserve"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}