import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const notificationId = parseInt(id);

    const existingNotification = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, user.id)
        )
      )
      .limit(1);

    if (existingNotification.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found', code: 'NOTIFICATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updated = await db
      .update(notifications)
      .set({
        isRead: true
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, user.id)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update notification', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT notification read error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}