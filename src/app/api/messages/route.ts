import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages, users } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const user1 = searchParams.get('user1');
    const user2 = searchParams.get('user2');
    const propertyId = searchParams.get('propertyId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db.select().from(messages);

    // Filter by userId (all messages where user is sender OR receiver)
    if (userId) {
      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) {
        return NextResponse.json({ 
          error: 'Invalid userId parameter',
          code: 'INVALID_USER_ID' 
        }, { status: 400 });
      }
      
      query = query.where(
        or(
          eq(messages.senderId, userIdInt),
          eq(messages.receiverId, userIdInt)
        )
      );
    }

    // Filter by conversation between two users
    if (user1 && user2) {
      const user1Int = parseInt(user1);
      const user2Int = parseInt(user2);
      
      if (isNaN(user1Int) || isNaN(user2Int)) {
        return NextResponse.json({ 
          error: 'Invalid user1 or user2 parameter',
          code: 'INVALID_USER_PARAMETERS' 
        }, { status: 400 });
      }
      
      query = query.where(
        or(
          and(
            eq(messages.senderId, user1Int),
            eq(messages.receiverId, user2Int)
          ),
          and(
            eq(messages.senderId, user2Int),
            eq(messages.receiverId, user1Int)
          )
        )
      );
    }

    // Filter by propertyId
    if (propertyId) {
      const propertyIdInt = parseInt(propertyId);
      if (isNaN(propertyIdInt)) {
        return NextResponse.json({ 
          error: 'Invalid propertyId parameter',
          code: 'INVALID_PROPERTY_ID' 
        }, { status: 400 });
      }
      
      const existingCondition = query;
      query = query.where(eq(messages.propertyId, propertyIdInt));
    }

    // Sort by sentAt descending (newest first) and apply pagination
    const results = await query
      .orderBy(desc(messages.sentAt))
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
    const { senderId, receiverId, content, propertyId, bookingId } = body;

    // Validate required fields
    if (!senderId) {
      return NextResponse.json({ 
        error: 'senderId is required',
        code: 'MISSING_SENDER_ID' 
      }, { status: 400 });
    }

    if (!receiverId) {
      return NextResponse.json({ 
        error: 'receiverId is required',
        code: 'MISSING_RECEIVER_ID' 
      }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ 
        error: 'content is required',
        code: 'MISSING_CONTENT' 
      }, { status: 400 });
    }

    // Validate senderId and receiverId are valid integers
    const senderIdInt = parseInt(senderId);
    const receiverIdInt = parseInt(receiverId);

    if (isNaN(senderIdInt)) {
      return NextResponse.json({ 
        error: 'senderId must be a valid integer',
        code: 'INVALID_SENDER_ID' 
      }, { status: 400 });
    }

    if (isNaN(receiverIdInt)) {
      return NextResponse.json({ 
        error: 'receiverId must be a valid integer',
        code: 'INVALID_RECEIVER_ID' 
      }, { status: 400 });
    }

    // Validate senderId and receiverId are different
    if (senderIdInt === receiverIdInt) {
      return NextResponse.json({ 
        error: 'senderId and receiverId must be different',
        code: 'SAME_SENDER_RECEIVER' 
      }, { status: 400 });
    }

    // Validate content is not empty after trimming
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return NextResponse.json({ 
        error: 'content cannot be empty',
        code: 'EMPTY_CONTENT' 
      }, { status: 400 });
    }

    // Verify sender exists
    const sender = await db.select()
      .from(users)
      .where(eq(users.id, senderIdInt))
      .limit(1);

    if (sender.length === 0) {
      return NextResponse.json({ 
        error: 'Sender user not found',
        code: 'SENDER_NOT_FOUND' 
      }, { status: 404 });
    }

    // Verify receiver exists
    const receiver = await db.select()
      .from(users)
      .where(eq(users.id, receiverIdInt))
      .limit(1);

    if (receiver.length === 0) {
      return NextResponse.json({ 
        error: 'Receiver user not found',
        code: 'RECEIVER_NOT_FOUND' 
      }, { status: 404 });
    }

    // Prepare insert data
    const insertData: any = {
      senderId: senderIdInt,
      receiverId: receiverIdInt,
      content: trimmedContent,
      isRead: false,
      sentAt: new Date().toISOString()
    };

    // Add optional fields if provided
    if (propertyId !== undefined && propertyId !== null) {
      const propertyIdInt = parseInt(propertyId);
      if (!isNaN(propertyIdInt)) {
        insertData.propertyId = propertyIdInt;
      }
    }

    if (bookingId !== undefined && bookingId !== null) {
      const bookingIdInt = parseInt(bookingId);
      if (!isNaN(bookingIdInt)) {
        insertData.bookingId = bookingIdInt;
      }
    }

    // Insert message
    const newMessage = await db.insert(messages)
      .values(insertData)
      .returning();

    return NextResponse.json(newMessage[0], { status: 201 });
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

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const messageId = parseInt(id);

    // Check if message exists
    const existingMessage = await db.select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (existingMessage.length === 0) {
      return NextResponse.json({ 
        error: 'Message not found',
        code: 'MESSAGE_NOT_FOUND' 
      }, { status: 404 });
    }

    // Update isRead to true
    const updated = await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}