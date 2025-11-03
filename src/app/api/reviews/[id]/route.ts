import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Fetch review by ID
    const review = await db.select()
      .from(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .limit(1);

    if (review.length === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(review[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if review exists
    const existingReview = await db.select()
      .from(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
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
      value
    } = body;

    // Validate rating fields (must be between 1-5 if provided)
    const ratingFields = [
      { name: 'rating', value: rating },
      { name: 'cleanliness', value: cleanliness },
      { name: 'accuracy', value: accuracy },
      { name: 'checkIn', value: checkIn },
      { name: 'communication', value: communication },
      { name: 'location', value: location },
      { name: 'value', value: value }
    ];

    for (const field of ratingFields) {
      if (field.value !== undefined && field.value !== null) {
        const numValue = Number(field.value);
        if (isNaN(numValue) || numValue < 1 || numValue > 5) {
          return NextResponse.json(
            { 
              error: `${field.name} must be between 1 and 5`,
              code: 'INVALID_RATING' 
            },
            { status: 400 }
          );
        }
      }
    }

    // Build update object with only provided fields
    const updates: any = {};

    if (rating !== undefined) updates.rating = Number(rating);
    if (comment !== undefined) updates.comment = comment;
    if (cleanliness !== undefined) updates.cleanliness = Number(cleanliness);
    if (accuracy !== undefined) updates.accuracy = Number(accuracy);
    if (checkIn !== undefined) updates.checkIn = Number(checkIn);
    if (communication !== undefined) updates.communication = Number(communication);
    if (location !== undefined) updates.location = Number(location);
    if (value !== undefined) updates.value = Number(value);

    // Update review
    const updated = await db.update(reviews)
      .set(updates)
      .where(eq(reviews.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if review exists
    const existingReview = await db.select()
      .from(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Delete review
    const deleted = await db.delete(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Review deleted successfully',
        review: deleted[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}