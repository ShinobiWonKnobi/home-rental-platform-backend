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
  userId?: number;
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
  status?: string;
  userId?: number;
  hostId?: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  userType: 'guest' | 'host' | 'both';
  joinedAt: string;
  isVerified: boolean;
}

export interface Review {
  id: number;
  propertyId: number;
  userId: number;
  bookingId: number;
  rating: number;
  comment?: string;
  cleanliness: number;
  accuracy: number;
  checkIn: number;
  communication: number;
  location: number;
  value: number;
  createdAt: string;
  user?: User;
}

export interface Wishlist {
  id: number;
  userId: number;
  propertyId: number;
  createdAt: string;
  property?: Property;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  propertyId?: number;
  bookingId?: number;
  content: string;
  isRead: boolean;
  sentAt: string;
  sender?: User;
  receiver?: User;
}

export interface PropertyAvailability {
  id: number;
  propertyId: number;
  date: string;
  isAvailable: boolean;
  price?: number;
}

export interface Transaction {
  id: number;
  bookingId: number;
  userId: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'booking' | 'review' | 'message' | 'payment' | 'system';
  isRead: boolean;
  relatedId?: number;
  createdAt: string;
}

export interface HostProfile {
  id: number;
  userId: number;
  languages: string[];
  responseTime: string;
  responseRate: number;
  superhostStatus: boolean;
  propertyCount: number;
  totalReviews: number;
  averageRating: number;
}