import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, properties } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// POST handler - Create booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, checkIn, checkOut, guests, guestName, guestEmail, totalPrice } = body;
    
    // Validate required fields
    if (!propertyId || !checkIn || !checkOut || !guests || !guestName || !guestEmail) {
      return NextResponse.json(
        { error: "Missing required fields", code: "MISSING_REQUIRED_FIELDS" },
        { status: 400 }
      );
    }
    
    // Validate guestName is not empty
    if (guestName.trim() === '') {
      return NextResponse.json(
        { error: "Guest name cannot be empty", code: "EMPTY_GUEST_NAME" },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      return NextResponse.json(
        { error: "Invalid email format", code: "INVALID_EMAIL" },
        { status: 400 }
      );
    }
    
    // Validate guests is a positive integer
    const guestCount = parseInt(guests);
    if (isNaN(guestCount) || guestCount <= 0) {
      return NextResponse.json(
        { error: "Guests must be a positive number", code: "INVALID_GUESTS" },
        { status: 400 }
      );
    }
    
    // Verify property exists
    const property = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
    if (property.length === 0) {
      return NextResponse.json(
        { error: "Property not found", code: "PROPERTY_NOT_FOUND" },
        { status: 404 }
      );
    }
    
    // Validate guest capacity
    if (guestCount > property[0].guests) {
      return NextResponse.json(
        { error: `Property can only accommodate ${property[0].guests} guests`, code: "EXCEEDS_CAPACITY" },
        { status: 400 }
      );
    }
    
    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format", code: "INVALID_DATE" },
        { status: 400 }
      );
    }
    
    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: "Check-out date must be after check-in date", code: "INVALID_DATE_RANGE" },
        { status: 400 }
      );
    }
    
    // Calculate total price if not provided
    let finalTotalPrice = totalPrice;
    if (!totalPrice) {
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      finalTotalPrice = nights * property[0].price;
    }
    
    // Create booking
    const booking = await db.insert(bookings).values({
      propertyId,
      checkIn,
      checkOut,
      guests: guestCount,
      totalPrice: finalTotalPrice,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    }).returning();
    
    return NextResponse.json(booking[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

// GET handler - Read bookings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const propertyId = searchParams.get('propertyId');
    const guestEmail = searchParams.get('guestEmail');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (id) {
      const bookingId = parseInt(id);
      if (isNaN(bookingId)) {
        return NextResponse.json({ 
          error: "Invalid ID parameter", 
          code: "INVALID_ID" 
        }, { status: 400 });
      }
      
      const record = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
      if (record.length === 0) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      return NextResponse.json(record[0]);
    }
    
    let query = db.select().from(bookings);
    const conditions = [];
    
    if (propertyId) {
      const propId = parseInt(propertyId);
      if (!isNaN(propId)) {
        conditions.push(eq(bookings.propertyId, propId));
      }
    }
    
    if (guestEmail && guestEmail.trim() !== '') {
      conditions.push(eq(bookings.guestEmail, guestEmail.trim().toLowerCase()));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const records = await query.limit(limit).offset(offset);
    return NextResponse.json(records);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

// DELETE handler - Delete booking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required", 
        code: "INVALID_ID" 
      }, { status: 400 });
    }
    
    const deletedRecord = await db.delete(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .returning();
    
    if (deletedRecord.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Booking deleted successfully', 
      id: parseInt(id) 
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}