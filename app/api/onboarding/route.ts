import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { usersTable, goalsTable, accountabilityPartnersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { onboardingSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = onboardingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Invalid data' },
        { status: 400 }
      );
    }

    const { goals } = result.data;

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    let user;
    if (existingUsers.length > 0) {
      user = existingUsers[0];
      // Update user to onboarded
      await db
        .update(usersTable)
        .set({ onboarded: true })
        .where(eq(usersTable.clerkId, userId));
    } else {
      // Insert new user
      const [newUser] = await db
        .insert(usersTable)
        .values({
          clerkId: userId,
          onboarded: true,
        })
        .returning();
      user = newUser;
    }

    // Delete existing goals for this user (if updating)
    // Cascade delete will automatically remove associated partners
    const existingGoals = await db
      .select({ id: goalsTable.id })
      .from(goalsTable)
      .where(eq(goalsTable.userId, user.id));

    for (const existingGoal of existingGoals) {
      await db.delete(goalsTable).where(eq(goalsTable.id, existingGoal.id));
    }

    // Insert new goals with partners
    for (const goalData of goals) {
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
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}

