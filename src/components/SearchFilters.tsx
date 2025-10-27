"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Users, Search } from "lucide-react";
import { format } from "date-fns";

interface SearchFiltersProps {
  onSearch: (filters: { location: string; checkIn?: Date; checkOut?: Date; guests: number }) => void;
}

export function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);

  const handleSearch = () => {
    onSearch({ location, checkIn, checkOut, guests });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Where are you going?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

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
                {checkIn ? format(checkIn, "MMM dd, yyyy") : "Add dates"}
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
                {checkOut ? format(checkOut, "MMM dd, yyyy") : "Add dates"}
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

        <div className="space-y-2">
          <Label htmlFor="guests">Guests</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="guests"
              type="number"
              min="1"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSearch} className="w-full md:w-auto" size="lg">
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </div>
  );
}
