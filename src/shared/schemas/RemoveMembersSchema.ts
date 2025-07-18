import { z } from 'zod';

export const RemoveGroupMembersSchema = z.object({
    userIds: z.array(z.string().min(1)).min(1, 'Select at least one user'),
});