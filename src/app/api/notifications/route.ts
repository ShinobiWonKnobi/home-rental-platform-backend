import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const VALID_TYPES = ['booking', 'review', 'message', 'payment', 'system'] as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const read = searchParams.get('read');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    if (!userId) {
      return NextResponse.json({
        error: 'userId parameter is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json({
        error: 'userId must be a valid integer',
        code: 'INVALID_USER_ID'
      }, { status: 400 });
    }

    const conditions = [eq(notifications.userId, userIdNum)];

    if (type) {
      if (!VALID_TYPES.includes(type as any)) {
        return NextResponse.json({
          error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`,
          code: 'INVALID_TYPE'
        }, { status: 400 });
      }
      conditions.push(eq(notifications.type, type));
    }

    if (read !== null) {
      const isRead = read === 'true';
      conditions.push(eq(notifications.isRead, isRead));
    }

    const results = await db.select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
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
    const { userId, title, message, type, relatedId, isRead } = body;

    if (!userId) {
      return NextResponse.json({
        error: 'userId is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    if (!title || title.trim() === '') {
      return NextResponse.json({
        error: 'title is required and cannot be empty',
        code: 'MISSING_TITLE'
      }, { status: 400 });
    }

    if (!message || message.trim() === '') {
      return NextResponse.json({
        error: 'message is required and cannot be empty',
        code: 'MISSING_MESSAGE'
      }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({
        error: 'type is required',
        code: 'MISSING_TYPE'
      }, { status: 400 });
    }

    if (!VALID_TYPES.includes(type as any)) {
      return NextResponse.json({
        error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`,
        code: 'INVALID_TYPE'
      }, { status: 400 });
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json({
        error: 'userId must be a valid integer',
        code: 'INVALID_USER_ID'
      }, { status: 400 });
    }

    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, userIdNum))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    const newNotification = await db.insert(notifications)
      .values({
        userId: userIdNum,
        title: title.trim(),
        message: message.trim(),
        type,
        isRead: isRead ?? false,
        relatedId: relatedId ?? null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newNotification[0], { status: 201 });
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
        error: 'Valid id parameter is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const notificationId = parseInt(id);

    const existing = await db.select()
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({
        error: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND'
      }, { status: 404 });
    }

    const updated = await db.update(notifications)
      .set({
        isRead: true
      })
      .where(eq(notifications.id, notificationId))
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
        error: 'Valid id parameter is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const notificationId = parseInt(id);

    const existing = await db.select()
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({
        error: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND'
      }, { status: 404 });
    }

    const deleted = await db.delete(notifications)
      .where(eq(notifications.id, notificationId))
      .returning();

    return NextResponse.json({
      message: 'Notification deleted successfully',
      notification: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}