import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hostProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const profile = await db
      .select()
      .from(hostProfiles)
      .where(eq(hostProfiles.id, parseInt(id)))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json(
        { error: 'Host profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(hostProfiles)
      .where(eq(hostProfiles.id, parseInt(id)))
      .limit(1);

    if (existingProfile.length === 0) {
      return NextResponse.json(
        { error: 'Host profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate responseTime if provided
    if (body.responseTime !== undefined) {
      const validResponseTimes = ['within an hour', 'within a few hours', 'within a day', 'a few days or more'];
      if (!validResponseTimes.includes(body.responseTime)) {
        return NextResponse.json(
          {
            error: 'Invalid response time. Must be one of: within an hour, within a few hours, within a day, a few days or more',
            code: 'INVALID_RESPONSE_TIME'
          },
          { status: 400 }
        );
      }
    }

    // Validate responseRate if provided (0-100)
    if (body.responseRate !== undefined) {
      const rate = parseInt(body.responseRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return NextResponse.json(
          {
            error: 'Response rate must be between 0 and 100',
            code: 'INVALID_RESPONSE_RATE'
          },
          { status: 400 }
        );
      }
    }

    // Validate averageRating if provided (0-5)
    if (body.averageRating !== undefined) {
      const rating = parseFloat(body.averageRating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        return NextResponse.json(
          {
            error: 'Average rating must be between 0 and 5',
            code: 'INVALID_RATING'
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data with only allowed fields
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (body.languages !== undefined) {
      updateData.languages = body.languages;
    }
    if (body.responseTime !== undefined) {
      updateData.responseTime = body.responseTime;
    }
    if (body.responseRate !== undefined) {
      updateData.responseRate = parseInt(body.responseRate);
    }
    if (body.superhostStatus !== undefined) {
      updateData.superhostStatus = Boolean(body.superhostStatus);
    }
    if (body.propertyCount !== undefined) {
      updateData.propertyCount = parseInt(body.propertyCount);
    }
    if (body.totalReviews !== undefined) {
      updateData.totalReviews = parseInt(body.totalReviews);
    }
    if (body.averageRating !== undefined) {
      updateData.averageRating = parseFloat(body.averageRating);
    }

    const updated = await db
      .update(hostProfiles)
      .set(updateData)
      .where(eq(hostProfiles.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update host profile', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}