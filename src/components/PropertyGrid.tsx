"use client";

import { PropertyCard } from "@/components/PropertyCard";
import type { Property } from "@/types";

interface PropertyGridProps {
  properties: Property[];
}

export function PropertyGrid({ properties }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No properties found</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}