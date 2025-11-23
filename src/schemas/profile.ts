import { z } from 'zod';

export const userProfileSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters').max(50),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  phone_number: z.string().nullable().optional().refine((val) => {
    if (!val) return true;
    return /^\+?[1-9]\d{1,14}$/.test(val);
  }, 'Invalid phone number format'),
  date_of_birth: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  blood_group: z.string().nullable().optional(),
  genotype: z.string().nullable().optional(),
  allergies: z.string().nullable().optional(),
  chronic_conditions: z.string().nullable().optional(),
  weight: z.union([z.string(), z.number()]).nullable().optional().transform(val => val ? Number(val) : null),
  height: z.union([z.string(), z.number()]).nullable().optional().transform(val => val ? Number(val) : null),
  notify_appointment_reminder_email: z.boolean().optional(),
  notify_appointment_reminder_sms: z.boolean().optional(),
  notify_appointment_reminder_push: z.boolean().optional(),
  notify_refill_reminder_email: z.boolean().optional(),
});

export type UserProfileFormValues = z.infer<typeof userProfileSchema>;

