// src/schemas/userSchema.ts
import { z } from 'zod';

export const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  blood_group: z.string().optional(),
  genotype: z.string().optional(),
  allergies: z.string().optional(),
  chronic_conditions: z.string().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  medical_history_summary: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
