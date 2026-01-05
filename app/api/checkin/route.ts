import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { usersTable, goalsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function isYesterday(date: Date, today: Date): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { goalId } = body;

    if (!goalId || typeof goalId !== 'number') {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    // Get user to verify ownership
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the goal and verify it belongs to the user
    const goals = await db
      .select()
      .from(goalsTable)
      .where(and(eq(goalsTable.id, goalId), eq(goalsTable.userId, user.id)))
      .limit(1);

    const goal = goals[0];
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const now = new Date();
    const lastCheckIn = goal.lastCheckInAt;

    let newStreak: number;

    if (!lastCheckIn) {
      // First check-in ever
      newStreak = 1;
    } else if (isSameDay(lastCheckIn, now)) {
      // Already checked in today - no change to streak
      return NextResponse.json({
        success: true,
        streak: goal.streak,
        lastCheckInAt: lastCheckIn.toISOString(),
        message: 'Already checked in today',
      });
    } else if (isYesterday(lastCheckIn, now)) {
      // Checked in yesterday - increment streak
      newStreak = goal.streak + 1;
    } else {
      // Missed days - reset streak to 1
      newStreak = 1;
    }

    // Update the goal record
    await db
      .update(goalsTable)
      .set({
        lastCheckInAt: now,
        streak: newStreak,
      })
      .where(eq(goalsTable.id, goalId));

    return NextResponse.json({
      success: true,
      streak: newStreak,
      lastCheckInAt: now.toISOString(),
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to record check-in' },
      { status: 500 }
    );
  }
}
