export interface Property {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  guests: number;
  amenities: string[];
  rating: number;
  reviews: number;
  hostName: string;
  hostAvatar: string;
  createdAt: string;
}

export interface Booking {
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
