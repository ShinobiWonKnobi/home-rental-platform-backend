import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Add properties table
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
});

// Add bookings table
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
});