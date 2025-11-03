"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Home } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Wishlist, Property } from "@/types";

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState<(Wishlist & { property: Property })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = 1; // Demo user

  useEffect(() => {
    fetchWishlists();
  }, []);

  const fetchWishlists = async () => {
    try {
      const response = await fetch(`/api/wishlists?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Fetch property details for each wishlist item
        const wishlistsWithProperties = await Promise.all(
          data.map(async (wishlist: Wishlist) => {
            const propResponse = await fetch(`/api/properties/${wishlist.propertyId}`);
            if (propResponse.ok) {
              const property = await propResponse.json();
              return { ...wishlist, property };
            }
            return wishlist;
          })
        );
        
        setWishlists(wishlistsWithProperties.filter((w) => w.property));
      }
    } catch (error) {
      console.error("Failed to fetch wishlists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-8 w-8" />
              <h1 className="text-2xl font-bold">HomeStay</h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 fill-red-500 text-red-500" />
            <h1 className="text-3xl font-bold">My Wishlist</h1>
          </div>
          <p className="text-muted-foreground">
            {wishlists.length} saved propert{wishlists.length !== 1 ? "ies" : "y"}
          </p>
        </div>

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
        ) : wishlists.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No saved properties yet</h2>
            <p className="text-muted-foreground mb-6">
              Start exploring and save your favorite places to stay
            </p>
            <Button asChild>
              <Link href="/">Browse Properties</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlists.map((wishlist) => (
              <PropertyCard key={wishlist.id} property={wishlist.property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
