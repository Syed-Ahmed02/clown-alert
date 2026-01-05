import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db/db';
import { usersTable, goalsTable, accountabilityPartnersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, userId))
    .limit(1);

  const user = users[0];

  if (!user || !user.onboarded) {
    redirect('/onboarding');
  }

  // Fetch all goals with their partners
  const goals = await db
    .select()
    .from(goalsTable)
    .where(eq(goalsTable.userId, user.id));

  // Fetch partners for each goal
  const goalsWithPartners = await Promise.all(
    goals.map(async (goal) => {
      const partners = await db
        .select()
        .from(accountabilityPartnersTable)
        .where(eq(accountabilityPartnersTable.goalId, goal.id));

      return {
        id: goal.id,
        goal: goal.goal,
        reminderCadence: goal.reminderCadence,
        streak: goal.streak,
        lastCheckInAt: goal.lastCheckInAt?.toISOString() || null,
        accountabilityPartners: partners.map(p => ({
          email: p.email,
          phone: p.phone,
        })),
      };
    })
  );

  return <DashboardClient goals={goalsWithPartners} />;
}
