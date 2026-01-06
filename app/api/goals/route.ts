import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { usersTable, goalsTable, accountabilityPartnersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { goalSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = goalSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Invalid data' },
        { status: 400 }
      );
    }

    const goalData = result.data;

    // Get or create user
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    let user;
    if (existingUsers.length > 0) {
      user = existingUsers[0];
    } else {
      // Create user if doesn't exist
      const [newUser] = await db
        .insert(usersTable)
        .values({
          clerkId: userId,
          onboarded: true, // User is adding a goal, so they're onboarded
        })
        .returning();
      user = newUser;
    }

    // Insert the new goal
    const [goal] = await db
      .insert(goalsTable)
      .values({
        userId: user.id,
        goal: goalData.goal,
        reminderCadence: goalData.reminderCadence || null,
        streak: 0,
      })
      .returning();

    // Insert accountability partners for this goal
    if (goalData.accountabilityPartners && goalData.accountabilityPartners.length > 0) {
      const partnersToInsert = goalData.accountabilityPartners
        .filter(p => p.email || p.phone) // Only insert if at least one contact method
        .map(partner => ({
          goalId: goal.id,
          email: partner.email || null,
          phone: partner.phone || null,
        }));

      if (partnersToInsert.length > 0) {
        await db.insert(accountabilityPartnersTable).values(partnersToInsert);
      }
    }

    return NextResponse.json({ success: true, goalId: goal.id });
  } catch (error) {
    console.error('Add goal error:', error);
    return NextResponse.json(
      { error: 'Failed to save goal' },
      { status: 500 }
    );
  }
}


