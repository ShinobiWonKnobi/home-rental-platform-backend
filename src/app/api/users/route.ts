import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_USER_TYPES = ['guest', 'host', 'both'] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single user by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(id)))
        .limit(1);

      if (user.length === 0) {
        return NextResponse.json(
          { error: 'User not found', code: 'USER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(user[0], { status: 200 });
    }

    // List users with pagination, search, and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const userType = searchParams.get('userType');
    const verified = searchParams.get('verified');

    let query = db.select().from(users);

    const conditions = [];

    // Search by name or email
    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    // Filter by userType
    if (userType) {
      if (!VALID_USER_TYPES.includes(userType as any)) {
        return NextResponse.json(
          { 
            error: 'Invalid userType. Must be one of: guest, host, both', 
            code: 'INVALID_USER_TYPE' 
          },
          { status: 400 }
        );
      }
      conditions.push(eq(users.userType, userType));
    }

    // Filter by isVerified
    if (verified !== null && verified !== undefined) {
      const isVerified = verified === 'true' ? 1 : 0;
      conditions.push(eq(users.isVerified, isVerified));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(users.joinedAt))
      .limit(limit)
      .offset(offset);

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
    const { email, name, userType, avatar, phone, bio, isVerified } = body;

    // Validate required fields
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!userType) {
      return NextResponse.json(
        { error: 'UserType is required', code: 'MISSING_USER_TYPE' },
        { status: 400 }
      );
    }

    // Validate email format
    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL_FORMAT' },
        { status: 400 }
      );
    }

    // Validate userType
    if (!VALID_USER_TYPES.includes(userType)) {
      return NextResponse.json(
        { 
          error: 'Invalid userType. Must be one of: guest, host, both', 
          code: 'INVALID_USER_TYPE' 
        },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, trimmedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists', code: 'DUPLICATE_EMAIL' },
        { status: 400 }
      );
    }

    // Sanitize and prepare data
    const trimmedName = name.trim();
    const joinedAt = new Date().toISOString();
    const verifiedStatus = isVerified !== undefined 
      ? (typeof isVerified === 'boolean' ? isVerified : Boolean(isVerified))
      : false;

    const newUser = await db
      .insert(users)
      .values({
        email: trimmedEmail,
        name: trimmedName,
        userType: userType,
        avatar: avatar?.trim() || null,
        phone: phone?.trim() || null,
        bio: bio?.trim() || null,
        joinedAt,
        isVerified: verifiedStatus,
      })
      .returning();

    return NextResponse.json(newUser[0], { status: 201 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, avatar, phone, bio, userType, isVerified } = body;

    // Check if trying to update forbidden fields
    if ('email' in body || 'joinedAt' in body) {
      return NextResponse.json(
        { 
          error: 'Cannot update email or joinedAt fields', 
          code: 'FORBIDDEN_FIELD_UPDATE' 
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate userType if provided
    if (userType && !VALID_USER_TYPES.includes(userType)) {
      return NextResponse.json(
        { 
          error: 'Invalid userType. Must be one of: guest, host, both', 
          code: 'INVALID_USER_TYPE' 
        },
        { status: 400 }
      );
    }

    // Validate name if provided
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: 'Name cannot be empty', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: any = {};

    if (name !== undefined) updates.name = name.trim();
    if (avatar !== undefined) updates.avatar = avatar?.trim() || null;
    if (phone !== undefined) updates.phone = phone?.trim() || null;
    if (bio !== undefined) updates.bio = bio?.trim() || null;
    if (userType !== undefined) updates.userType = userType;
    if (isVerified !== undefined) {
      updates.isVerified = typeof isVerified === 'boolean' ? isVerified : Boolean(isVerified);
    }

    const updatedUser = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedUser[0], { status: 200 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      { 
        message: 'User deleted successfully', 
        user: deletedUser[0] 
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