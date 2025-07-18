import { z } from 'zod';

export const UpdateGroupRolesSchema = z.object({
  userIds: z
    .array(z.string().min(1, 'User ID is required'))
    .min(1, 'At least one user must be selected'),
  role: z.enum(['admin', 'member'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be either admin or member',
  }),
});

export type UpdateGroupRolesInput = z.infer<typeof UpdateGroupRolesSchema>;