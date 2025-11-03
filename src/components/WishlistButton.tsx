"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WishlistButtonProps {
  propertyId: number;
  userId?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost";
}

export function WishlistButton({ 
  propertyId, 
  userId = 1, // Default to user 1 for demo
  size = "md",
  variant = "ghost" 
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkWishlistStatus();
  }, [propertyId, userId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch(`/api/wishlists?userId=${userId}`);
      if (response.ok) {
        const wishlists = await response.json();
        const exists = wishlists.some((w: any) => w.propertyId === propertyId);
        setIsInWishlist(exists);
      }
    } catch (error) {
      console.error("Failed to check wishlist:", error);
    }
  };

  const toggleWishlist = async () => {
    setIsLoading(true);
    try {
      if (isInWishlist) {
        // Find and remove from wishlist
        const response = await fetch(`/api/wishlists?userId=${userId}`);
        if (response.ok) {
          const wishlists = await response.json();
          const wishlist = wishlists.find((w: any) => w.propertyId === propertyId);
          if (wishlist) {
            await fetch(`/api/wishlists/${wishlist.id}`, { method: "DELETE" });
            setIsInWishlist(false);
            toast.success("Removed from wishlist");
          }
        }
      } else {
        // Add to wishlist
        const response = await fetch("/api/wishlists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, propertyId }),
        });
        if (response.ok) {
          setIsInWishlist(true);
          toast.success("Added to wishlist");
        }
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <Button
      variant={variant}
      size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
      onClick={toggleWishlist}
      disabled={isLoading}
      className="relative group"
    >
      <Heart
        className={`${iconSize} transition-all ${
          isInWishlist ? "fill-red-500 text-red-500" : "text-current"
        }`}
      />
      <span className="sr-only">{isInWishlist ? "Remove from" : "Add to"} wishlist</span>
    </Button>
  );
}
