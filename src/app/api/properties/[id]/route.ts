import { NextResponse } from 'next/server';
import { db } from '@/db';
import { properties } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate ID parameter
    const propertyId = parseInt(id);
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "Invalid ID parameter", code: "INVALID_ID" },
        { status: 400 }
      );
    }
    
    const property = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
    
    if (property.length === 0) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(property[0]);
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error },
      { status: 500 }
    );
  }
}