import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wishlists, users, properties } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db.select().from(wishlists);

    if (userId) {
      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) {
        return NextResponse.json({ 
          error: "Valid userId is required",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }
      query = query.where(eq(wishlists.userId, userIdInt));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
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
    const { userId, propertyId } = body;

    if (!userId) {
      return NextResponse.json({ 
        error: "userId is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!propertyId) {
      return NextResponse.json({ 
        error: "propertyId is required",
        code: "MISSING_PROPERTY_ID" 
      }, { status: 400 });
    }

    const userIdInt = parseInt(userId);
    const propertyIdInt = parseInt(propertyId);

    if (isNaN(userIdInt)) {
      return NextResponse.json({ 
        error: "Valid userId is required",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    if (isNaN(propertyIdInt)) {
      return NextResponse.json({ 
        error: "Valid propertyId is required",
        code: "INVALID_PROPERTY_ID" 
      }, { status: 400 });
    }

    const userExists = await db.select()
      .from(users)
      .where(eq(users.id, userIdInt))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json({ 
        error: "User not found",
        code: "USER_NOT_FOUND" 
      }, { status: 400 });
    }

    const propertyExists = await db.select()
      .from(properties)
      .where(eq(properties.id, propertyIdInt))
      .limit(1);

    if (propertyExists.length === 0) {
      return NextResponse.json({ 
        error: "Property not found",
        code: "PROPERTY_NOT_FOUND" 
      }, { status: 400 });
    }

    const existingWishlist = await db.select()
      .from(wishlists)
      .where(and(
        eq(wishlists.userId, userIdInt),
        eq(wishlists.propertyId, propertyIdInt)
      ))
      .limit(1);

    if (existingWishlist.length > 0) {
      return NextResponse.json({ 
        error: "Property is already in wishlist",
        code: "DUPLICATE_WISHLIST_ENTRY" 
      }, { status: 400 });
    }

    const newWishlist = await db.insert(wishlists)
      .values({
        userId: userIdInt,
        propertyId: propertyIdInt,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newWishlist[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const wishlistId = parseInt(id);

    const existingWishlist = await db.select()
      .from(wishlists)
      .where(eq(wishlists.id, wishlistId))
      .limit(1);

    if (existingWishlist.length === 0) {
      return NextResponse.json({ 
        error: "Wishlist entry not found",
        code: "WISHLIST_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(wishlists)
      .where(eq(wishlists.id, wishlistId))
      .returning();

    return NextResponse.json({ 
      message: "Wishlist entry deleted successfully",
      deleted: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}