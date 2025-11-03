import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions, bookings, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const VALID_STATUSES = ['pending', 'completed', 'refunded', 'failed'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const bookingId = searchParams.get('bookingId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let query = db.select().from(transactions);

    const conditions = [];
    if (bookingId) {
      conditions.push(eq(transactions.bookingId, parseInt(bookingId)));
    }
    if (userId) {
      conditions.push(eq(transactions.userId, parseInt(userId)));
    }
    if (status) {
      conditions.push(eq(transactions.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(transactions.createdAt))
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
    const { bookingId, userId, amount, currency, status, paymentMethod, transactionId } = body;

    // Validate required fields
    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required', code: 'MISSING_BOOKING_ID' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'status is required', code: 'MISSING_STATUS' },
        { status: 400 }
      );
    }

    // Validate amount is positive integer
    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive integer', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate status
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { 
          error: `status must be one of: ${VALID_STATUSES.join(', ')}`, 
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    // Verify bookingId exists
    const bookingExists = await db.select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(bookingId)))
      .limit(1);

    if (bookingExists.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'BOOKING_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Verify userId exists
    const userExists = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Verify transactionId is unique if provided
    if (transactionId) {
      const transactionIdExists = await db.select()
        .from(transactions)
        .where(eq(transactions.transactionId, transactionId))
        .limit(1);

      if (transactionIdExists.length > 0) {
        return NextResponse.json(
          { error: 'transactionId already exists', code: 'DUPLICATE_TRANSACTION_ID' },
          { status: 400 }
        );
      }
    }

    // Create transaction
    const newTransaction = await db.insert(transactions)
      .values({
        bookingId: parseInt(bookingId),
        userId: parseInt(userId),
        amount: parseInt(amount),
        currency: currency || 'USD',
        status,
        paymentMethod: paymentMethod || null,
        transactionId: transactionId || null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newTransaction[0], { status: 201 });
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
    const { status, paymentMethod } = body;

    // Check if transaction exists
    const existingTransaction = await db.select()
      .from(transactions)
      .where(eq(transactions.id, parseInt(id)))
      .limit(1);

    if (existingTransaction.length === 0) {
      return NextResponse.json(
        { error: 'Transaction not found', code: 'TRANSACTION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { 
          error: `status must be one of: ${VALID_STATUSES.join(', ')}`, 
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    // Build update object
    const updates: any = {};
    if (status !== undefined) {
      updates.status = status;
    }
    if (paymentMethod !== undefined) {
      updates.paymentMethod = paymentMethod;
    }

    // Update transaction
    const updatedTransaction = await db.update(transactions)
      .set(updates)
      .where(eq(transactions.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedTransaction[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}