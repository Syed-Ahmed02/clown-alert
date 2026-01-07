'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { IconFlame, IconCalendar, IconCheck, IconTarget, IconUsers, IconBell, IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { AddGoalModal } from '@/components/AddGoalModal';

interface Goal {
  id: number;
  goal: string;
  reminderCadence: string | null;
  streak: number;
  lastCheckInAt: string | null;
  accountabilityPartners: Array<{ email: string | null; phone: string | null }>;
}

interface DashboardClientProps {
  goals: Goal[];
}

export function DashboardClient({ goals: initialGoals }: DashboardClientProps) {
  const router = useRouter();
  const [goals, setGoals] = useState(initialGoals);
  const [checkingInGoalId, setCheckingInGoalId] = useState<number | null>(null);
  const [justCheckedIn, setJustCheckedIn] = useState<number | null>(null);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);

  const handleCheckIn = async (goalId: number) => {
    setCheckingInGoalId(goalId);
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId }),
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(goals.map(g => 
          g.id === goalId 
            ? { ...g, streak: data.streak, lastCheckInAt: data.lastCheckInAt }
            : g
        ));
        setJustCheckedIn(goalId);
        setTimeout(() => setJustCheckedIn(null), 3000);
      }
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setCheckingInGoalId(null);
    }
  };

  const formatLastCheckIn = (dateStr: string | null) => {
    if (!dateStr) return 'Never';

    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const isCheckedInToday = (dateStr: string | null) => {
    if (!dateStr) return false;
    const lastCheck = new Date(dateStr);
    const today = new Date();
    return (
      lastCheck.getDate() === today.getDate() &&
      lastCheck.getMonth() === today.getMonth() &&
      lastCheck.getFullYear() === today.getFullYear()
    );
  };

  if (goals.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <IconTarget className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">2026 Goals</span>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9',
                },
              }}
            />
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Card className="p-12">
            <CardContent className="flex flex-col items-center">
              <IconTarget className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold mb-2">No goals yet</CardTitle>
              <CardDescription className="mb-6">Start by adding your first goal!</CardDescription>
              <Button
                onClick={() => setIsAddGoalModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <IconPlus className="w-4 h-4 mr-2" />
                Add Your First Goal
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <IconTarget className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">2026 Goals</span>
            <span className="text-sm text-muted-foreground ml-2">({goals.length})</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddGoalModalOpen(true)}
              className="text-primary hover:text-primary/80 hover:bg-accent"
            >
              <IconPlus className="w-4 h-4 mr-1" />
              Add Goal
            </Button>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9',
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {goals.map((goal) => {
          const checkedToday = isCheckedInToday(goal.lastCheckInAt);
          const isChecking = checkingInGoalId === goal.id;
          const justChecked = justCheckedIn === goal.id;

          return (
            <Card
              key={goal.id}
            >
              <CardHeader>
                {/* Goal Header */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <IconTarget className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardDescription className="mb-1">By December 31st, 2026, I will...</CardDescription>
                    <CardTitle className="text-xl font-medium leading-relaxed">{goal.goal}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Streak */}
                <div className="bg-muted rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IconFlame className={`w-4 h-4 ${goal.streak > 0 ? 'text-orange-400' : 'text-muted-foreground'}`} />
                    <span className="text-xs text-muted-foreground">Streak</span>
                  </div>
                  <p className={`text-2xl font-bold ${goal.streak > 0 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                    {goal.streak}
                    <span className="text-sm font-normal ml-1">day{goal.streak !== 1 ? 's' : ''}</span>
                  </p>
                </div>

                {/* Last Check-in */}
                <div className="bg-muted rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IconCalendar className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-muted-foreground">Last Check-in</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatLastCheckIn(goal.lastCheckInAt)}
                  </p>
                </div>

                {/* Cadence */}
                <div className="bg-muted rounded-xl p-4 col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <IconBell className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-muted-foreground">Reminder</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground capitalize">
                    {goal.reminderCadence || 'None'}
                  </p>
                </div>
              </div>

              {/* Check-in Button */}
              <div className="flex flex-col items-center gap-3">
                <Button
                  onClick={() => handleCheckIn(goal.id)}
                  disabled={isChecking || checkedToday}
                  className={`w-full max-w-sm h-14 text-lg font-semibold transition-all duration-300 ${
                    checkedToday
                      ? 'bg-green-600/20 text-green-400 border-2 border-green-500/30'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02]'
                  } disabled:hover:scale-100`}
                >
                  {isChecking ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                      Checking in...
                    </span>
                  ) : checkedToday ? (
                    <span className="flex items-center gap-2">
                      <IconCheck className="w-5 h-5" />
                      Checked in today!
                    </span>
                  ) : (
                    'Mark Done'
                  )}
                </Button>

                {justChecked && (
                  <div className="animate-bounce text-green-400 flex items-center gap-2 text-sm">
                    <IconFlame className="w-4 h-4" />
                    <span>Keep it up! Streak: {goal.streak} days</span>
                  </div>
                )}
              </div>

              {/* Accountability Partners */}
              {goal.accountabilityPartners.length > 0 && (
                <div className="pt-4">
                  <Separator className="mb-4" />
                  <div className="flex items-center gap-2 mb-3">
                    <IconUsers className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">Accountability Partners</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {goal.accountabilityPartners.map((partner, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                      >
                        {partner.email && (
                          <span>{partner.email}</span>
                        )}
                        {partner.email && partner.phone && (
                          <span className="text-muted-foreground mx-2">•</span>
                        )}
                        {partner.phone && (
                          <span>{partner.phone}</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              </CardContent>
            </Card>
          );
        })}
      </main>

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        onSuccess={() => {
          // Refresh the page to show the new goal
          router.refresh();
        }}
      />
    </div>
  );
}
