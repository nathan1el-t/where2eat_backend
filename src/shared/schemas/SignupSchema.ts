import { z } from 'zod';

export const SignupSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    username: z.string().trim().min(1, 'Username is required'),
    email: z.string().trim().email('Invalid email'),
    password: z
      .string()
      .trim()
      .min(6, 'Password must be at least 6 characters')
      .max(30, 'Password must be at most 30 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{6,30}$/,
        'Password must include uppercase, lowercase, number, special character, and be 6–30 characters long'
      ),
    passwordConfirm: z.string().trim(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export type SignupInput = z.infer<typeof SignupSchema>;
