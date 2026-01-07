'use client';

import { useState } from 'react';
import { GoalForm } from './GoalForm';
import { type GoalFormData } from '@/lib/validations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddGoalModal({ isOpen, onClose, onSuccess }: AddGoalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Goal</DialogTitle>
          <DialogDescription>
            Create a new goal to track your progress throughout 2026
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <div className="bg-muted/50 border border-border rounded-xl p-6">
          <GoalForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitLabel="Add Goal"
            showCancel={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}


