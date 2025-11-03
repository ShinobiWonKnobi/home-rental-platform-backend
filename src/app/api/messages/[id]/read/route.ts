import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

    const messageId = parseInt(id);

    // Check if message exists
    const existingMessage = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (existingMessage.length === 0) {
      return NextResponse.json(
        { 
          error: 'Message not found',
          code: 'MESSAGE_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Update the message to mark it as read
    const updatedMessage = await db
      .update(messages)
      .set({
        isRead: true
      })
      .where(eq(messages.id, messageId))
      .returning();

    return NextResponse.json(updatedMessage[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}