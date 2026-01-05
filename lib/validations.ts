import { z } from 'zod';

export const accountabilityPartnerSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^[+]?[\d\s-()]+$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
});

export const goalSchema = z.object({
  goal: z
    .string()
    .min(10, 'Goal must be at least 10 characters')
    .max(200, 'Goal must be at most 200 characters'),
  reminderCadence: z.enum(['daily', 'weekly', '']).optional(),
  accountabilityPartners: z.array(accountabilityPartnerSchema).min(0).max(10, 'Maximum 10 partners per goal'),
});

export const onboardingSchema = z.object({
  goals: z.array(goalSchema).min(1, 'At least one goal is required').max(20, 'Maximum 20 goals'),
});

export type AccountabilityPartnerFormData = z.infer<typeof accountabilityPartnerSchema>;
export type GoalFormData = z.infer<typeof goalSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;

