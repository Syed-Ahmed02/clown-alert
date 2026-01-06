'use client';

import { useState } from 'react';
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
import { goalSchema, type GoalFormData, type AccountabilityPartnerFormData } from '@/lib/validations';
import { IconTarget, IconMail, IconPhone, IconBell, IconPlus, IconX } from '@tabler/icons-react';

interface GoalFormProps {
  initialGoal?: GoalFormData;
  onSubmit: (goal: GoalFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  showCancel?: boolean;
}

export function GoalForm({
  initialGoal,
  onSubmit,
  onCancel,
  submitLabel = 'Save Goal',
  showCancel = false,
}: GoalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [goal, setGoal] = useState<GoalFormData>(
    initialGoal || {
      goal: '',
      reminderCadence: '',
      accountabilityPartners: [],
    }
  );

  const updateGoal = (field: keyof GoalFormData, value: string) => {
    setGoal({ ...goal, [field]: value });
  };

  const addPartner = () => {
    setGoal({
      ...goal,
      accountabilityPartners: [...goal.accountabilityPartners, { email: '', phone: '' }],
    });
  };

  const removePartner = (partnerIndex: number) => {
    setGoal({
      ...goal,
      accountabilityPartners: goal.accountabilityPartners.filter((_, i) => i !== partnerIndex),
    });
  };

  const updatePartner = (partnerIndex: number, field: 'email' | 'phone', value: string) => {
    const updated = [...goal.accountabilityPartners];
    updated[partnerIndex][field] = value;
    setGoal({ ...goal, accountabilityPartners: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = goalSchema.safeParse(goal);
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
      await onSubmit(result.data);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save goal' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = goal.goal.length;
  const isValidLength = charCount >= 10 && charCount <= 200;
  const goalError = errors.goal;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Goal Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <IconTarget className="w-4 h-4 text-purple-400" />
          By Dec 31, 2026, I will...
        </label>
        <Textarea
          placeholder="Run a marathon, launch my startup, learn a new language..."
          value={goal.goal}
          onChange={(e) => updateGoal('goal', e.target.value)}
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
          onValueChange={(value) => updateGoal('reminderCadence', value || '')}
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
            onClick={addPartner}
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
                onClick={() => removePartner(partnerIndex)}
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
                  onChange={(e) => updatePartner(partnerIndex, 'email', e.target.value)}
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
                  onChange={(e) => updatePartner(partnerIndex, 'phone', e.target.value)}
                  className="bg-slate-600/50 border-slate-600 text-white placeholder:text-slate-500 h-9 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3">
        {showCancel && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !isValidLength}
          className={`${showCancel ? 'flex-1' : 'w-full'} h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100`}
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>

      {errors.submit && (
        <p className="text-center text-red-400 text-sm">{errors.submit}</p>
      )}
    </form>
  );
}


