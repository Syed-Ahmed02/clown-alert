'use client';

import { useState } from 'react';
import { GoalForm } from './GoalForm';
import { type GoalFormData } from '@/lib/validations';
import { IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddGoalModal({ isOpen, onClose, onSuccess }: AddGoalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (goal: GoalFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save goal');
      }

      onSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Goal</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <IconX className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <GoalForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitLabel="Add Goal"
            showCancel={true}
          />
        </div>
      </div>
    </div>
  );
}


