'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { onboardingSchema, type GoalFormData, type AccountabilityPartnerFormData } from '@/lib/validations';
import { IconTarget, IconMail, IconPhone, IconBell, IconPlus, IconX } from '@tabler/icons-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [goals, setGoals] = useState<GoalFormData[]>([
    {
      goal: '',
      reminderCadence: '',
      accountabilityPartners: [],
    },
  ]);

  // Redirect to sign-in if not authenticated (client-side fallback)
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show nothing while checking auth
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  const addGoal = () => {
    setGoals([...goals, { goal: '', reminderCadence: '', accountabilityPartners: [] }]);
  };

  const removeGoal = (index: number) => {
    if (goals.length > 1) {
      setGoals(goals.filter((_, i) => i !== index));
    }
  };

  const updateGoal = (index: number, field: keyof GoalFormData, value: string) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const addPartner = (goalIndex: number) => {
    const updated = [...goals];
    updated[goalIndex].accountabilityPartners.push({ email: '', phone: '' });
    setGoals(updated);
  };

  const removePartner = (goalIndex: number, partnerIndex: number) => {
    const updated = [...goals];
    updated[goalIndex].accountabilityPartners = updated[goalIndex].accountabilityPartners.filter(
      (_, i) => i !== partnerIndex
    );
    setGoals(updated);
  };

  const updatePartner = (
    goalIndex: number,
    partnerIndex: number,
    field: 'email' | 'phone',
    value: string
  ) => {
    const updated = [...goals];
    updated[goalIndex].accountabilityPartners[partnerIndex][field] = value;
    setGoals(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = onboardingSchema.safeParse({ goals });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals }),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setErrors({ submit: data.error || 'Something went wrong' });
      }
    } catch {
      setErrors({ submit: 'Failed to save. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
            <IconTarget className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Set Your 2026 Goals</h1>
          <p className="text-slate-400">
            What will you accomplish by December 31st, 2026?
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {goals.map((goal, goalIndex) => {
              const goalError = errors[`goals.${goalIndex}.goal`];
              const charCount = goal.goal.length;
              const isValidLength = charCount >= 10 && charCount <= 200;

              return (
                <div
                  key={goalIndex}
                  className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 space-y-6"
                >
                  {/* Goal Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <IconTarget className="w-5 h-5 text-purple-400" />
                      Goal {goalIndex + 1}
                    </h2>
                    {goals.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeGoal(goalIndex)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <IconX className="w-5 h-5" />
                      </Button>
                    )}
                  </div>

                  {/* Goal Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      By Dec 31, 2026, I will...
                    </label>
                    <Textarea
                      placeholder="Run a marathon, launch my startup, learn a new language..."
                      value={goal.goal}
                      onChange={(e) => updateGoal(goalIndex, 'goal', e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 min-h-24 resize-none"
                      maxLength={200}
                    />
                    <div className="flex justify-between text-xs">
                      <span className={goalError ? 'text-red-400' : 'text-transparent'}>
                        {goalError || 'placeholder'}
                      </span>
                      <span className={`${isValidLength ? 'text-green-400' : charCount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                        {charCount}/200
                      </span>
                    </div>
                  </div>

                  {/* Reminder Cadence */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <IconBell className="w-4 h-4 text-amber-400" />
                      Reminder Cadence
                    </label>
                    <Select
                      value={goal.reminderCadence || ''}
                      onValueChange={(value) => updateGoal(goalIndex, 'reminderCadence', value || '')}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white w-full h-10">
                        <SelectValue>
                          {goal.reminderCadence ? (
                            goal.reminderCadence === 'daily' ? 'Daily' : 'Weekly'
                          ) : (
                            <span className="text-slate-500">Select how often to check in</span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="daily" className="text-slate-200 focus:bg-purple-500/20">
                          Daily
                        </SelectItem>
                        <SelectItem value="weekly" className="text-slate-200 focus:bg-purple-500/20">
                          Weekly
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Accountability Partners */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <IconMail className="w-4 h-4 text-pink-400" />
                        Accountability Partners
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addPartner(goalIndex)}
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                      >
                        <IconPlus className="w-4 h-4 mr-1" />
                        Add Partner
                      </Button>
                    </div>

                    {goal.accountabilityPartners.length === 0 && (
                      <p className="text-xs text-slate-500 italic">
                        No partners added. They&apos;ll be notified if you miss a check-in.
                      </p>
                    )}

                    {goal.accountabilityPartners.map((partner, partnerIndex) => (
                      <div
                        key={partnerIndex}
                        className="bg-slate-700/30 rounded-lg p-4 space-y-3 border border-slate-600/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400">Partner {partnerIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => removePartner(goalIndex, partnerIndex)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <IconX className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs text-slate-400 flex items-center gap-1">
                              <IconMail className="w-3 h-3" />
                              Email
                            </label>
                            <Input
                              type="email"
                              placeholder="friend@example.com"
                              value={partner.email}
                              onChange={(e) => updatePartner(goalIndex, partnerIndex, 'email', e.target.value)}
                              className="bg-slate-600/50 border-slate-600 text-white placeholder:text-slate-500 h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-slate-400 flex items-center gap-1">
                              <IconPhone className="w-3 h-3" />
                              Phone
                            </label>
                            <Input
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              value={partner.phone}
                              onChange={(e) => updatePartner(goalIndex, partnerIndex, 'phone', e.target.value)}
                              className="bg-slate-600/50 border-slate-600 text-white placeholder:text-slate-500 h-9 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Add Goal Button */}
            <Button
              type="button"
              variant="outline"
              onClick={addGoal}
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <IconPlus className="w-4 h-4 mr-2" />
              Add Another Goal
            </Button>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || goals.some(g => g.goal.length < 10 || g.goal.length > 200)}
              className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? 'Saving...' : 'Start My Journey'}
            </Button>

            {errors.submit && (
              <p className="text-center text-red-400 text-sm">{errors.submit}</p>
            )}
          </div>
        </form>

        {/* Footer text */}
        <p className="text-center text-slate-500 text-sm mt-6">
          You can always add more goals and partners later
        </p>
      </div>
    </div>
  );
}
