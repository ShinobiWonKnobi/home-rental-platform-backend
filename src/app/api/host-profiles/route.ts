import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hostProfiles, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_RESPONSE_TIMES = ["within an hour", "within a few hours", "within a day"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: "Valid userId is required",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    const profile = await db.select()
      .from(hostProfiles)
      .where(eq(hostProfiles.userId, parseInt(userId)))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ 
        error: 'Host profile not found',
        code: "PROFILE_NOT_FOUND" 
      }, { status: 404 });
    }

    return NextResponse.json(profile[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, languages, responseTime, responseRate, superhostStatus, propertyCount, totalReviews, averageRating } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        error: "userId is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!languages) {
      return NextResponse.json({ 
        error: "languages is required",
        code: "MISSING_LANGUAGES" 
      }, { status: 400 });
    }

    if (!responseTime) {
      return NextResponse.json({ 
        error: "responseTime is required",
        code: "MISSING_RESPONSE_TIME" 
      }, { status: 400 });
    }

    if (responseRate === undefined || responseRate === null) {
      return NextResponse.json({ 
        error: "responseRate is required",
        code: "MISSING_RESPONSE_RATE" 
      }, { status: 400 });
    }

    // Validate userId is a valid integer
    if (isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: "userId must be a valid integer",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    // Validate userId exists in users table
    const userExists = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json({ 
        error: "User does not exist",
        code: "USER_NOT_FOUND" 
      }, { status: 400 });
    }

    // Check if host profile already exists for this user
    const existingProfile = await db.select()
      .from(hostProfiles)
      .where(eq(hostProfiles.userId, parseInt(userId)))
      .limit(1);

    if (existingProfile.length > 0) {
      return NextResponse.json({ 
        error: "Host profile already exists for this user",
        code: "DUPLICATE_PROFILE" 
      }, { status: 400 });
    }

    // Validate languages is an array
    if (!Array.isArray(languages)) {
      return NextResponse.json({ 
        error: "languages must be an array",
        code: "INVALID_LANGUAGES_FORMAT" 
      }, { status: 400 });
    }

    // Validate responseTime
    if (!VALID_RESPONSE_TIMES.includes(responseTime)) {
      return NextResponse.json({ 
        error: `responseTime must be one of: ${VALID_RESPONSE_TIMES.join(', ')}`,
        code: "INVALID_RESPONSE_TIME" 
      }, { status: 400 });
    }

    // Validate responseRate
    const rate = parseInt(responseRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      return NextResponse.json({ 
        error: "responseRate must be between 0 and 100",
        code: "INVALID_RESPONSE_RATE" 
      }, { status: 400 });
    }

    // Validate averageRating if provided
    if (averageRating !== undefined && averageRating !== null) {
      const rating = parseFloat(averageRating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        return NextResponse.json({ 
          error: "averageRating must be between 0 and 5",
          code: "INVALID_AVERAGE_RATING" 
        }, { status: 400 });
      }
    }

    // Prepare insert data with defaults
    const insertData: any = {
      userId: parseInt(userId),
      languages: languages,
      responseTime: responseTime.trim(),
      responseRate: rate,
      superhostStatus: superhostStatus !== undefined ? superhostStatus : false,
      propertyCount: propertyCount !== undefined ? parseInt(propertyCount) : 0,
      totalReviews: totalReviews !== undefined ? parseInt(totalReviews) : 0,
      averageRating: averageRating !== undefined ? parseFloat(averageRating) : 0,
    };

    const newProfile = await db.insert(hostProfiles)
      .values(insertData)
      .returning();

    return NextResponse.json(newProfile[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid id is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { languages, responseTime, responseRate, superhostStatus, propertyCount, totalReviews, averageRating } = body;

    // Check if profile exists
    const existingProfile = await db.select()
      .from(hostProfiles)
      .where(eq(hostProfiles.id, parseInt(id)))
      .limit(1);

    if (existingProfile.length === 0) {
      return NextResponse.json({ 
        error: 'Host profile not found',
        code: "PROFILE_NOT_FOUND" 
      }, { status: 404 });
    }

    // Build update object
    const updates: any = {};

    // Validate and add languages if provided
    if (languages !== undefined) {
      if (!Array.isArray(languages)) {
        return NextResponse.json({ 
          error: "languages must be an array",
          code: "INVALID_LANGUAGES_FORMAT" 
        }, { status: 400 });
      }
      updates.languages = languages;
    }

    // Validate and add responseTime if provided
    if (responseTime !== undefined) {
      if (!VALID_RESPONSE_TIMES.includes(responseTime)) {
        return NextResponse.json({ 
          error: `responseTime must be one of: ${VALID_RESPONSE_TIMES.join(', ')}`,
          code: "INVALID_RESPONSE_TIME" 
        }, { status: 400 });
      }
      updates.responseTime = responseTime.trim();
    }

    // Validate and add responseRate if provided
    if (responseRate !== undefined) {
      const rate = parseInt(responseRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return NextResponse.json({ 
          error: "responseRate must be between 0 and 100",
          code: "INVALID_RESPONSE_RATE" 
        }, { status: 400 });
      }
      updates.responseRate = rate;
    }

    // Validate and add averageRating if provided
    if (averageRating !== undefined) {
      const rating = parseFloat(averageRating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        return NextResponse.json({ 
          error: "averageRating must be between 0 and 5",
          code: "INVALID_AVERAGE_RATING" 
        }, { status: 400 });
      }
      updates.averageRating = rating;
    }

    // Add other fields if provided
    if (superhostStatus !== undefined) {
      updates.superhostStatus = superhostStatus;
    }

    if (propertyCount !== undefined) {
      updates.propertyCount = parseInt(propertyCount);
    }

    if (totalReviews !== undefined) {
      updates.totalReviews = parseInt(totalReviews);
    }

    // If no fields to update, return error
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No fields to update",
        code: "NO_UPDATE_FIELDS" 
      }, { status: 400 });
    }

    const updated = await db.update(hostProfiles)
      .set(updates)
      .where(eq(hostProfiles.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}