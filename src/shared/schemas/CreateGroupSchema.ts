import { z } from 'zod';

export const CreateGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Group name must be at least 3 characters')
    .max(50, 'Group name must be at most 50 characters'),
  description: z.string().trim().max(500, 'Description too long').optional(),
});

export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;
