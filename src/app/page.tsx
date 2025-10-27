"use client";

import { useState, useEffect } from "react";
import { SearchFilters } from "@/components/SearchFilters";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property } from "@/types";
import { Home } from "lucide-react";

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProperties = async (filters?: { location: string; guests: number }) => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (filters?.location) {
        params.append("location", filters.location);
      }
      if (filters?.guests) {
        params.append("guests", filters.guests.toString());
      }

      const url = `/api/properties${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      const data = await response.json();
      setProperties(data);
    } catch (err) {
      setError("Failed to load properties. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearch = (filters: { location: string; guests: number }) => {
    fetchProperties(filters);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Home className="h-8 w-8" />
            <h1 className="text-2xl font-bold">HomeStay</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 container mx-auto px-4 text-center space-y-6">
          <h2 className="text-5xl md:text-6xl font-bold">Find your perfect stay</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover unique homes and experiences around the world
          </p>
          <div className="max-w-5xl mx-auto mt-8">
            <SearchFilters onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold mb-8">Featured Properties</h3>

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive bg-destructive/10 p-4 rounded-lg inline-block">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <PropertyGrid properties={properties} />
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:underline">How it works</a></li>
                <li><a href="#" className="hover:underline">Newsroom</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:underline">Blog</a></li>
                <li><a href="#" className="hover:underline">Forum</a></li>
                <li><a href="#" className="hover:underline">Invite friends</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Host</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:underline">List your property</a></li>
                <li><a href="#" className="hover:underline">Host resources</a></li>
                <li><a href="#" className="hover:underline">Community forum</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:underline">Help Center</a></li>
                <li><a href="#" className="hover:underline">Safety information</a></li>
                <li><a href="#" className="hover:underline">Cancellation options</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 HomeStay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}