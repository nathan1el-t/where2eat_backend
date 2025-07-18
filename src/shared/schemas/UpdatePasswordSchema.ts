import { z } from 'zod';

export const UpdatePasswordSchema = z
  .object({
    passwordCurrent: z.string().trim(),
    passwordNew: z
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
  .refine((data) => data.passwordNew === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ['passwordConfirm'],
  });

export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;
