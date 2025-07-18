import { z } from 'zod';

export const JoinGroupSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, 'Code must be exactly 6 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Code must be alphanumeric'),
});

export type JoinGroupInput = z.infer<typeof JoinGroupSchema>;
