import { auth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ onboarded: false }, { status: 401 });
  }

  const users = await db
    .select({ onboarded: usersTable.onboarded })
    .from(usersTable)
    .where(eq(usersTable.clerkId, userId))
    .limit(1);

  const user = users[0];

  return NextResponse.json({ onboarded: user?.onboarded ?? false });
}

