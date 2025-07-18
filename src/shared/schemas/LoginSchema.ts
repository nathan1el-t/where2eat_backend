import { z } from 'zod';

export const LoginSchema = z.object({
  usernameOrEmail: z.string().trim().min(1, 'Username or email is required'),
  password: z.string().trim().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;
