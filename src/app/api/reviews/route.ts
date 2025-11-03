import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, properties, users, bookings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single review by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const review = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, parseInt(id)))
        .limit(1);

      if (review.length === 0) {
        return NextResponse.json(
          { error: 'Review not found', code: 'REVIEW_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(review[0], { status: 200 });
    }

    // List reviews with filtering and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const propertyId = searchParams.get('propertyId');
    const userId = searchParams.get('userId');
    const bookingId = searchParams.get('bookingId');

    let query = db.select().from(reviews);

    // Build filter conditions
    const conditions = [];
    if (propertyId) {
      conditions.push(eq(reviews.propertyId, parseInt(propertyId)));
    }
    if (userId) {
      conditions.push(eq(reviews.userId, parseInt(userId)));
    }
    if (bookingId) {
      conditions.push(eq(reviews.bookingId, parseInt(bookingId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      userId,
      bookingId,
      rating,
      comment,
      cleanliness,
      accuracy,
      checkIn,
      communication,
      location,
      value,
    } = body;

    // Validate required fields
    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required', code: 'MISSING_PROPERTY_ID' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required', code: 'MISSING_BOOKING_ID' },
        { status: 400 }
      );
    }

    if (rating === undefined || rating === null) {
      return NextResponse.json(
        { error: 'Rating is required', code: 'MISSING_RATING' },
        { status: 400 }
      );
    }

    if (cleanliness === undefined || cleanliness === null) {
      return NextResponse.json(
        { error: 'Cleanliness rating is required', code: 'MISSING_CLEANLINESS' },
        { status: 400 }
      );
    }

    if (accuracy === undefined || accuracy === null) {
      return NextResponse.json(
        { error: 'Accuracy rating is required', code: 'MISSING_ACCURACY' },
        { status: 400 }
      );
    }

    if (checkIn === undefined || checkIn === null) {
      return NextResponse.json(
        { error: 'Check-in rating is required', code: 'MISSING_CHECK_IN' },
        { status: 400 }
      );
    }

    if (communication === undefined || communication === null) {
      return NextResponse.json(
        { error: 'Communication rating is required', code: 'MISSING_COMMUNICATION' },
        { status: 400 }
      );
    }

    if (location === undefined || location === null) {
      return NextResponse.json(
        { error: 'Location rating is required', code: 'MISSING_LOCATION' },
        { status: 400 }
      );
    }

    if (value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Value rating is required', code: 'MISSING_VALUE' },
        { status: 400 }
      );
    }

    // Validate rating ranges
    const ratingFields = [
      { name: 'rating', value: rating },
      { name: 'cleanliness', value: cleanliness },
      { name: 'accuracy', value: accuracy },
      { name: 'checkIn', value: checkIn },
      { name: 'communication', value: communication },
      { name: 'location', value: location },
      { name: 'value', value: value },
    ];

    for (const field of ratingFields) {
      if (typeof field.value !== 'number' || field.value < 1 || field.value > 5) {
        return NextResponse.json(
          {
            error: `${field.name} must be a number between 1 and 5`,
            code: 'INVALID_RATING_RANGE',
          },
          { status: 400 }
        );
      }
    }

    // Verify foreign key references exist
    const property = await db
      .select()
      .from(properties)
      .where(eq(properties.id, parseInt(propertyId)))
      .limit(1);

    if (property.length === 0) {
      return NextResponse.json(
        { error: 'Property not found', code: 'PROPERTY_NOT_FOUND' },
        { status: 404 }
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(bookingId)))
      .limit(1);

    if (booking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'BOOKING_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Create new review
    const newReview = await db
      .insert(reviews)
      .values({
        propertyId: parseInt(propertyId),
        userId: parseInt(userId),
        bookingId: parseInt(bookingId),
        rating: parseFloat(rating),
        comment: comment || null,
        cleanliness: parseInt(cleanliness),
        accuracy: parseInt(accuracy),
        checkIn: parseInt(checkIn),
        communication: parseInt(communication),
        location: parseInt(location),
        value: parseInt(value),
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newReview[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      rating,
      comment,
      cleanliness,
      accuracy,
      checkIn,
      communication,
      location,
      value,
    } = body;

    // Check if review exists
    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Review not found', code: 'REVIEW_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate rating ranges if provided
    const ratingFields = [
      { name: 'rating', value: rating },
      { name: 'cleanliness', value: cleanliness },
      { name: 'accuracy', value: accuracy },
      { name: 'checkIn', value: checkIn },
      { name: 'communication', value: communication },
      { name: 'location', value: location },
      { name: 'value', value: value },
    ];

    for (const field of ratingFields) {
      if (field.value !== undefined && field.value !== null) {
        if (typeof field.value !== 'number' || field.value < 1 || field.value > 5) {
          return NextResponse.json(
            {
              error: `${field.name} must be a number between 1 and 5`,
              code: 'INVALID_RATING_RANGE',
            },
            { status: 400 }
          );
        }
      }
    }

    // Build update object with only provided fields
    const updates: any = {};
    if (rating !== undefined) updates.rating = parseFloat(rating);
    if (comment !== undefined) updates.comment = comment;
    if (cleanliness !== undefined) updates.cleanliness = parseInt(cleanliness);
    if (accuracy !== undefined) updates.accuracy = parseInt(accuracy);
    if (checkIn !== undefined) updates.checkIn = parseInt(checkIn);
    if (communication !== undefined) updates.communication = parseInt(communication);
    if (location !== undefined) updates.location = parseInt(location);
    if (value !== undefined) updates.value = parseInt(value);

    // Update review
    const updated = await db
      .update(reviews)
      .set(updates)
      .where(eq(reviews.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if review exists
    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Review not found', code: 'REVIEW_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete review
    const deleted = await db
      .delete(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Review deleted successfully',
        review: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}