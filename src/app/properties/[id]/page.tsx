import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Star, MapPin, Users, Bed, Bath, Wifi, Waves, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageGallery } from "@/components/ImageGallery";
import { BookingForm } from "@/components/BookingForm";
import { ReviewsSection } from "@/components/ReviewsSection";
import { WishlistButton } from "@/components/WishlistButton";

async function getProperty(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/properties/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  const amenityIcons: Record<string, any> = {
    WiFi: Wifi,
    Pool: Waves,
    Kitchen: Home,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm hover:underline text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to properties
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-black" />
                  <span className="font-semibold">{property.rating}</span>
                  <span className="text-muted-foreground">({property.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{property.location}</span>
                </div>
              </div>
            </div>
            <WishlistButton propertyId={property.id} size="lg" />
          </div>
        </div>

        <ImageGallery images={property.images} title={property.title} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Hosted by {property.hostName}
                  </h2>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {property.guests} guests
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {property.bedrooms} bedroom{property.bedrooms > 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      {property.bathrooms} bathroom{property.bathrooms > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <Avatar className="h-16 w-16">
                  <AvatarImage src={property.hostAvatar} alt={property.hostName} />
                  <AvatarFallback>{property.hostName[0]}</AvatarFallback>
                </Avatar>
              </div>
              <Separator />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">About this place</h3>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-4">
                {property.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity] || Home;
                  return (
                    <div key={amenity} className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            <ReviewsSection propertyId={property.id} />
          </div>

          <div className="lg:col-span-1">
            <BookingForm property={property} />
          </div>
        </div>
      </div>
    </div>
  );
}