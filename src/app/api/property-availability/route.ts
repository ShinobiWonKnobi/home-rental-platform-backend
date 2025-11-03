import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { propertyAvailability, properties } from '@/db/schema';
import { eq, and, gte, lte, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '90'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    if (!propertyId) {
      return NextResponse.json({ 
        error: 'propertyId is required',
        code: 'MISSING_PROPERTY_ID'
      }, { status: 400 });
    }

    if (isNaN(parseInt(propertyId))) {
      return NextResponse.json({ 
        error: 'Valid propertyId is required',
        code: 'INVALID_PROPERTY_ID'
      }, { status: 400 });
    }

    const propertyIdInt = parseInt(propertyId);

    // Verify property exists
    const property = await db.select()
      .from(properties)
      .where(eq(properties.id, propertyIdInt))
      .limit(1);

    if (property.length === 0) {
      return NextResponse.json({ 
        error: 'Property not found',
        code: 'PROPERTY_NOT_FOUND'
      }, { status: 404 });
    }

    let query = db.select()
      .from(propertyAvailability)
      .where(eq(propertyAvailability.propertyId, propertyIdInt));

    // Apply date range filters if provided
    if (startDate && endDate) {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return NextResponse.json({ 
          error: 'Invalid date format. Use YYYY-MM-DD',
          code: 'INVALID_DATE_FORMAT'
        }, { status: 400 });
      }

      query = db.select()
        .from(propertyAvailability)
        .where(
          and(
            eq(propertyAvailability.propertyId, propertyIdInt),
            gte(propertyAvailability.date, startDate),
            lte(propertyAvailability.date, endDate)
          )
        );
    } else if (startDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate)) {
        return NextResponse.json({ 
          error: 'Invalid date format. Use YYYY-MM-DD',
          code: 'INVALID_DATE_FORMAT'
        }, { status: 400 });
      }

      query = db.select()
        .from(propertyAvailability)
        .where(
          and(
            eq(propertyAvailability.propertyId, propertyIdInt),
            gte(propertyAvailability.date, startDate)
          )
        );
    } else if (endDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(endDate)) {
        return NextResponse.json({ 
          error: 'Invalid date format. Use YYYY-MM-DD',
          code: 'INVALID_DATE_FORMAT'
        }, { status: 400 });
      }

      query = db.select()
        .from(propertyAvailability)
        .where(
          and(
            eq(propertyAvailability.propertyId, propertyIdInt),
            lte(propertyAvailability.date, endDate)
          )
        );
    }

    const results = await query
      .orderBy(asc(propertyAvailability.date))
      .limit(limit)
      .offset(offset);

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
    const { propertyId, date, isAvailable, price } = body;

    // Validate required fields
    if (!propertyId) {
      return NextResponse.json({ 
        error: 'propertyId is required',
        code: 'MISSING_PROPERTY_ID'
      }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ 
        error: 'date is required',
        code: 'MISSING_DATE'
      }, { status: 400 });
    }

    if (isAvailable === undefined || isAvailable === null) {
      return NextResponse.json({ 
        error: 'isAvailable is required',
        code: 'MISSING_IS_AVAILABLE'
      }, { status: 400 });
    }

    // Validate propertyId is integer
    if (isNaN(parseInt(propertyId))) {
      return NextResponse.json({ 
        error: 'Valid propertyId is required',
        code: 'INVALID_PROPERTY_ID'
      }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({ 
        error: 'Invalid date format. Use YYYY-MM-DD',
        code: 'INVALID_DATE_FORMAT'
      }, { status: 400 });
    }

    // Validate isAvailable is boolean
    if (typeof isAvailable !== 'boolean') {
      return NextResponse.json({ 
        error: 'isAvailable must be a boolean',
        code: 'INVALID_IS_AVAILABLE'
      }, { status: 400 });
    }

    // Validate price is integer if provided
    if (price !== undefined && price !== null && isNaN(parseInt(price))) {
      return NextResponse.json({ 
        error: 'price must be a valid integer',
        code: 'INVALID_PRICE'
      }, { status: 400 });
    }

    const propertyIdInt = parseInt(propertyId);

    // Verify property exists
    const property = await db.select()
      .from(properties)
      .where(eq(properties.id, propertyIdInt))
      .limit(1);

    if (property.length === 0) {
      return NextResponse.json({ 
        error: 'Property not found',
        code: 'PROPERTY_NOT_FOUND'
      }, { status: 404 });
    }

    // Check for duplicate (same propertyId + date)
    const existing = await db.select()
      .from(propertyAvailability)
      .where(
        and(
          eq(propertyAvailability.propertyId, propertyIdInt),
          eq(propertyAvailability.date, date)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      const updated = await db.update(propertyAvailability)
        .set({
          isAvailable,
          price: price !== undefined && price !== null ? parseInt(price) : null
        })
        .where(eq(propertyAvailability.id, existing[0].id))
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    }

    // Insert new record
    const insertData: any = {
      propertyId: propertyIdInt,
      date,
      isAvailable,
      price: price !== undefined && price !== null ? parseInt(price) : null
    };

    const newAvailability = await db.insert(propertyAvailability)
      .values(insertData)
      .returning();

    return NextResponse.json(newAvailability[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const idInt = parseInt(id);
    const body = await request.json();
    const { isAvailable, price } = body;

    // Validate at least one field to update
    if (isAvailable === undefined && price === undefined) {
      return NextResponse.json({ 
        error: 'At least one field (isAvailable or price) must be provided',
        code: 'NO_FIELDS_TO_UPDATE'
      }, { status: 400 });
    }

    // Validate isAvailable if provided
    if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
      return NextResponse.json({ 
        error: 'isAvailable must be a boolean',
        code: 'INVALID_IS_AVAILABLE'
      }, { status: 400 });
    }

    // Validate price if provided
    if (price !== undefined && price !== null && isNaN(parseInt(price))) {
      return NextResponse.json({ 
        error: 'price must be a valid integer',
        code: 'INVALID_PRICE'
      }, { status: 400 });
    }

    // Check if record exists
    const record = await db.select()
      .from(propertyAvailability)
      .where(eq(propertyAvailability.id, idInt))
      .limit(1);

    if (record.length === 0) {
      return NextResponse.json({ 
        error: 'Availability record not found',
        code: 'RECORD_NOT_FOUND'
      }, { status: 404 });
    }

    // Prepare update data
    const updates: any = {};
    if (isAvailable !== undefined) {
      updates.isAvailable = isAvailable;
    }
    if (price !== undefined) {
      updates.price = price !== null ? parseInt(price) : null;
    }

    const updated = await db.update(propertyAvailability)
      .set(updates)
      .where(eq(propertyAvailability.id, idInt))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
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
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const idInt = parseInt(id);

    // Check if record exists
    const record = await db.select()
      .from(propertyAvailability)
      .where(eq(propertyAvailability.id, idInt))
      .limit(1);

    if (record.length === 0) {
      return NextResponse.json({ 
        error: 'Availability record not found',
        code: 'RECORD_NOT_FOUND'
      }, { status: 404 });
    }

    const deleted = await db.delete(propertyAvailability)
      .where(eq(propertyAvailability.id, idInt))
      .returning();

    return NextResponse.json({ 
      message: 'Availability record deleted successfully',
      record: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}