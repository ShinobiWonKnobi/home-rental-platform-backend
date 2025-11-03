import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { propertyAvailability } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isAvailable, price } = body;

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(propertyAvailability)
      .where(eq(propertyAvailability.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Property availability record not found' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (isAvailable !== undefined) {
      updates.isAvailable = isAvailable;
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return NextResponse.json(
          { 
            error: 'Price must be a positive number',
            code: 'INVALID_PRICE' 
          },
          { status: 400 }
        );
      }
      updates.price = price;
    }

    // Update the record
    const updated = await db
      .update(propertyAvailability)
      .set(updates)
      .where(eq(propertyAvailability.id, parseInt(id)))
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if record exists before deleting
    const existingRecord = await db
      .select()
      .from(propertyAvailability)
      .where(eq(propertyAvailability.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Property availability record not found' },
        { status: 404 }
      );
    }

    // Delete the record
    const deleted = await db
      .delete(propertyAvailability)
      .where(eq(propertyAvailability.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Property availability record deleted successfully',
        deleted: deleted[0]
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