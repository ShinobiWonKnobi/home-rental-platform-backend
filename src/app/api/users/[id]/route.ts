import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Invalid ID parameter",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    // Query database for user with that ID
    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Return 404 if user not found
    if (user.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return 200 with user object
    return NextResponse.json(user[0], { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}