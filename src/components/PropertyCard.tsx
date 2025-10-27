"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Users, Bed, Bath } from "lucide-react";
import type { Property } from "@/types";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3">
            <Badge className="bg-white text-black hover:bg-white">
              <Star className="w-3 h-3 fill-black mr-1" />
              {property.rating}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
            <div className="flex items-baseline gap-1 ml-2">
              <span className="text-xl font-bold">${property.price}</span>
              <span className="text-sm text-muted-foreground">/night</span>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">{property.location}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{property.guests} guests</span>
            </div>
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} bath</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {property.amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{property.amenities.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}