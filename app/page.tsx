import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db/db';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const { userId } = await auth();

  // If user is authenticated, redirect based on onboarding status
  if (userId) {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    const user = users[0];

    if (user?.onboarded) {
      redirect('/dashboard');
    } else {
      redirect('/onboarding');
    }
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Make 2026 your year
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Stay accountable to your{' '}
              <span className="text-primary">
                2026 goals
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Set your goal, check in daily, and let your accountability buddy know if you fall behind.
              Simple, effective, no excuses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 hover:scale-[1.02]">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button 
                variant="outline" 
                className="h-14 px-8 text-lg rounded-xl"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Daily Check-ins</h3>
              <p className="text-muted-foreground text-sm">Mark your progress every day and build an unstoppable streak.</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 text-left">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Accountability Buddy</h3>
              <p className="text-muted-foreground text-sm">Add a friend who gets notified when you miss check-ins.</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 text-left">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Streak Tracking</h3>
              <p className="text-muted-foreground text-sm">Watch your streak grow and stay motivated all year.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-muted-foreground text-sm">
          Build something great in 2026.
        </div>
      </footer>
    </div>
  );
}
