import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { properties } from '@/db/schema';
import { eq, like, and, gte } from 'drizzle-orm';

// GET handler - Read properties with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const location = searchParams.get('location');
    const minGuests = searchParams.get('guests');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (id) {
      const propertyId = parseInt(id);
      if (isNaN(propertyId)) {
        return NextResponse.json({ 
          error: "Invalid ID parameter", 
          code: "INVALID_ID" 
        }, { status: 400 });
      }
      
      const record = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
      if (record.length === 0) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }
      return NextResponse.json(record[0]);
    }
    
    let query = db.select().from(properties);
    const conditions = [];
    
    if (location && location.trim() !== '') {
      conditions.push(like(properties.location, `%${location}%`));
    }
    
    if (minGuests) {
      const guestCount = parseInt(minGuests);
      if (!isNaN(guestCount)) {
        conditions.push(gte(properties.guests, guestCount));
      }
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

// POST handler - Create property
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, description, location, price, images, bedrooms, bathrooms, 
      guests, amenities, rating, reviews, hostName, hostAvatar 
    } = body;
    
    // Validate required fields
    if (!title || !description || !location || !hostName || !hostAvatar) {
      return NextResponse.json({ 
        error: "Missing required fields", 
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }
    
    // Validate trimmed fields are not empty
    if (title.trim() === '' || description.trim() === '' || location.trim() === '') {
      return NextResponse.json({ 
        error: "Title, description, and location cannot be empty", 
        code: "EMPTY_FIELDS" 
      }, { status: 400 });
    }
    
    // Validate numeric fields
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ 
        error: "Price must be a positive number", 
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }
    
    if (typeof bedrooms !== 'number' || bedrooms < 0) {
      return NextResponse.json({ 
        error: "Bedrooms must be a non-negative number", 
        code: "INVALID_BEDROOMS" 
      }, { status: 400 });
    }
    
    if (typeof bathrooms !== 'number' || bathrooms < 0) {
      return NextResponse.json({ 
        error: "Bathrooms must be a non-negative number", 
        code: "INVALID_BATHROOMS" 
      }, { status: 400 });
    }
    
    if (typeof guests !== 'number' || guests <= 0) {
      return NextResponse.json({ 
        error: "Guests must be a positive number", 
        code: "INVALID_GUESTS" 
      }, { status: 400 });
    }
    
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      return NextResponse.json({ 
        error: "Rating must be between 0 and 5", 
        code: "INVALID_RATING" 
      }, { status: 400 });
    }
    
    if (typeof reviews !== 'number' || reviews < 0) {
      return NextResponse.json({ 
        error: "Reviews must be a non-negative number", 
        code: "INVALID_REVIEWS" 
      }, { status: 400 });
    }
    
    // Validate arrays
    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ 
        error: "Images must be a non-empty array", 
        code: "INVALID_IMAGES" 
      }, { status: 400 });
    }
    
    if (!Array.isArray(amenities)) {
      return NextResponse.json({ 
        error: "Amenities must be an array", 
        code: "INVALID_AMENITIES" 
      }, { status: 400 });
    }
    
    const newRecord = await db.insert(properties).values({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      price,
      images,
      bedrooms,
      bathrooms,
      guests,
      amenities,
      rating,
      reviews,
      hostName: hostName.trim(),
      hostAvatar: hostAvatar.trim(),
      createdAt: new Date().toISOString(),
    }).returning();
    
    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

// PUT handler - Update property
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required", 
        code: "INVALID_ID" 
      }, { status: 400 });
    }
    
    const updates = await request.json();
    
    // Validate numeric fields if provided
    if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price <= 0)) {
      return NextResponse.json({ 
        error: "Price must be a positive number", 
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }
    
    if (updates.rating !== undefined && (typeof updates.rating !== 'number' || updates.rating < 0 || updates.rating > 5)) {
      return NextResponse.json({ 
        error: "Rating must be between 0 and 5", 
        code: "INVALID_RATING" 
      }, { status: 400 });
    }
    
    // Sanitize string fields if provided
    if (updates.title) updates.title = updates.title.trim();
    if (updates.description) updates.description = updates.description.trim();
    if (updates.location) updates.location = updates.location.trim();
    if (updates.hostName) updates.hostName = updates.hostName.trim();
    
    const updatedRecord = await db.update(properties)
      .set(updates)
      .where(eq(properties.id, parseInt(id)))
      .returning();
    
    if (updatedRecord.length === 0) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedRecord[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

// DELETE handler - Delete property
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
    
    const deletedRecord = await db.delete(properties)
      .where(eq(properties.id, parseInt(id)))
      .returning();
    
    if (deletedRecord.length === 0) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Property deleted successfully', 
      id: parseInt(id) 
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}