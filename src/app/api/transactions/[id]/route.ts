import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_STATUSES = ['pending', 'completed', 'refunded', 'failed'] as const;

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

    // Fetch transaction by ID
    const transaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, parseInt(id)))
      .limit(1);

    if (transaction.length === 0) {
      return NextResponse.json(
        { 
          error: 'Transaction not found',
          code: 'TRANSACTION_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
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

    // Check if transaction exists
    const existingTransaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, parseInt(id)))
      .limit(1);

    if (existingTransaction.length === 0) {
      return NextResponse.json(
        { 
          error: 'Transaction not found',
          code: 'TRANSACTION_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, paymentMethod } = body;

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { 
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    // Prepare update object
    const updates: {
      status?: string;
      paymentMethod?: string;
    } = {};

    if (status !== undefined) {
      updates.status = status;
    }

    if (paymentMethod !== undefined) {
      updates.paymentMethod = paymentMethod;
    }

    // Check if there are any updates to apply
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { 
          error: 'No valid fields to update',
          code: 'NO_UPDATES'
        },
        { status: 400 }
      );
    }

    // Update transaction
    const updated = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}