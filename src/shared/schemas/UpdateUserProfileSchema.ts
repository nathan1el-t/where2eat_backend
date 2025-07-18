import { z } from 'zod';

export const UpdateUserProfileSchema = z.object({
  username: z.string().min(1).trim().optional(),
  email: z.string().email().trim().optional(),
  firstName: z.string().min(1).trim().optional(),
  lastName: z.string().min(1).trim().optional(),
});

export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
