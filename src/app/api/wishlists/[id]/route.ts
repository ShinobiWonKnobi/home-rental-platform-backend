import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wishlists } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID is valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const wishlistId = parseInt(id);

    // Check if wishlist exists before deleting
    const existingWishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, wishlistId))
      .limit(1);

    if (existingWishlist.length === 0) {
      return NextResponse.json(
        { 
          error: 'Wishlist entry not found',
          code: 'WISHLIST_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Delete wishlist entry with returning
    const deleted = await db
      .delete(wishlists)
      .where(eq(wishlists.id, wishlistId))
      .returning();

    return NextResponse.json(
      {
        message: 'Wishlist entry deleted successfully',
        data: deleted[0]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE wishlist error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}