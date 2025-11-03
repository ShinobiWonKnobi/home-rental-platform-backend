import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Keep existing properties table
export const properties = sqliteTable('properties', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  price: integer('price').notNull(),
  images: text('images', { mode: 'json' }).notNull(),
  bedrooms: integer('bedrooms').notNull(),
  bathrooms: integer('bathrooms').notNull(),
  guests: integer('guests').notNull(),
  amenities: text('amenities', { mode: 'json' }).notNull(),
  rating: real('rating').notNull(),
  reviews: integer('reviews').notNull(),
  hostName: text('host_name').notNull(),
  hostAvatar: text('host_avatar').notNull(),
  createdAt: text('created_at').notNull(),
  userId: integer('user_id'),
});

// Keep existing bookings table with modifications
export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  propertyId: integer('property_id').notNull().references(() => properties.id),
  checkIn: text('check_in').notNull(),
  checkOut: text('check_out').notNull(),
  guests: integer('guests').notNull(),
  totalPrice: integer('total_price').notNull(),
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  createdAt: text('created_at').notNull(),
  status: text('status').notNull().default('pending'),
  userId: integer('user_id'),
  hostId: integer('host_id'),
});

// Add new users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  phone: text('phone'),
  bio: text('bio'),
  userType: text('user_type').notNull(),
  joinedAt: text('joined_at').notNull(),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
});

// Add new reviews table
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  propertyId: integer('property_id').notNull().references(() => properties.id),
  userId: integer('user_id').notNull().references(() => users.id),
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  rating: real('rating').notNull(),
  comment: text('comment'),
  cleanliness: integer('cleanliness').notNull(),
  accuracy: integer('accuracy').notNull(),
  checkIn: integer('check_in').notNull(),
  communication: integer('communication').notNull(),
  location: integer('location').notNull(),
  value: integer('value').notNull(),
  createdAt: text('created_at').notNull(),
});

// Add new wishlists table
export const wishlists = sqliteTable('wishlists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  propertyId: integer('property_id').notNull().references(() => properties.id),
  createdAt: text('created_at').notNull(),
});

// Add new messages table
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: integer('sender_id').notNull().references(() => users.id),
  receiverId: integer('receiver_id').notNull().references(() => users.id),
  propertyId: integer('property_id').references(() => properties.id),
  bookingId: integer('booking_id').references(() => bookings.id),
  content: text('content').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  sentAt: text('sent_at').notNull(),
});

// Add new property_availability table
export const propertyAvailability = sqliteTable('property_availability', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  propertyId: integer('property_id').notNull().references(() => properties.id),
  date: text('date').notNull(),
  isAvailable: integer('is_available', { mode: 'boolean' }).default(true),
  price: integer('price'),
});

// Add new transactions table
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  userId: integer('user_id').notNull().references(() => users.id),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  status: text('status').notNull(),
  paymentMethod: text('payment_method'),
  transactionId: text('transaction_id').unique(),
  createdAt: text('created_at').notNull(),
});

// Add new notifications table
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  relatedId: integer('related_id'),
  createdAt: text('created_at').notNull(),
});

// Add new host_profiles table
export const hostProfiles = sqliteTable('host_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().unique().references(() => users.id),
  languages: text('languages', { mode: 'json' }).notNull(),
  responseTime: text('response_time').notNull(),
  responseRate: integer('response_rate').notNull(),
  superhostStatus: integer('superhost_status', { mode: 'boolean' }).default(false),
  propertyCount: integer('property_count').default(0),
  totalReviews: integer('total_reviews').default(0),
  averageRating: real('average_rating').default(0),
});