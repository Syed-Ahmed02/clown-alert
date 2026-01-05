'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <header className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <IconTarget className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white">2026 Goals</span>
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
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12">
            <IconTarget className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No goals yet</h2>
            <p className="text-slate-400 mb-6">Start by adding your first goal!</p>
            <Button
              onClick={() => setIsAddGoalModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              <IconPlus className="w-4 h-4 mr-2" />
              Add Your First Goal
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <IconTarget className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-white">2026 Goals</span>
            <span className="text-sm text-slate-400 ml-2">({goals.length})</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddGoalModalOpen(true)}
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
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
            <div
              key={goal.id}
              className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 space-y-6"
            >
              {/* Goal Header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                  <IconTarget className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">By December 31st, 2026, I will...</p>
                  <p className="text-xl font-medium text-white leading-relaxed">{goal.goal}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Streak */}
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IconFlame className={`w-4 h-4 ${goal.streak > 0 ? 'text-orange-400' : 'text-slate-500'}`} />
                    <span className="text-xs text-slate-400">Streak</span>
                  </div>
                  <p className={`text-2xl font-bold ${goal.streak > 0 ? 'text-orange-400' : 'text-slate-500'}`}>
                    {goal.streak}
                    <span className="text-sm font-normal ml-1">day{goal.streak !== 1 ? 's' : ''}</span>
                  </p>
                </div>

                {/* Last Check-in */}
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IconCalendar className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-slate-400">Last Check-in</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatLastCheckIn(goal.lastCheckInAt)}
                  </p>
                </div>

                {/* Cadence */}
                <div className="bg-slate-700/30 rounded-xl p-4 col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <IconBell className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-slate-400">Reminder</span>
                  </div>
                  <p className="text-2xl font-bold text-white capitalize">
                    {goal.reminderCadence || 'None'}
                  </p>
                </div>
              </div>

              {/* Check-in Button */}
              <div className="flex flex-col items-center gap-3">
                <Button
                  onClick={() => handleCheckIn(goal.id)}
                  disabled={isChecking || checkedToday}
                  className={`w-full max-w-sm h-14 text-lg font-semibold rounded-xl transition-all duration-300 ${
                    checkedToday
                      ? 'bg-green-600/20 text-green-400 border-2 border-green-500/30'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white hover:scale-[1.02]'
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
                <div className="border-t border-slate-700/50 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconUsers className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-medium text-slate-300">Accountability Partners</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {goal.accountabilityPartners.map((partner, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-700/30 rounded-lg px-3 py-2 text-xs"
                      >
                        {partner.email && (
                          <span className="text-slate-300">{partner.email}</span>
                        )}
                        {partner.email && partner.phone && (
                          <span className="text-slate-500 mx-2">•</span>
                        )}
                        {partner.phone && (
                          <span className="text-slate-300">{partner.phone}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
