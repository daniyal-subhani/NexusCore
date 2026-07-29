import { z } from '@nexus-core/common';

export const registerSchema = z.object({
  body: z.object({
    email: z.email('Invalid email format').trim().toLowerCase(),
    password: z.string().min(8, 'Password must be 8 characters long.'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email('Invalid email format').trim().toLowerCase(),
    password: z.string().min(1, 'Password is required.'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const revokeSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID format'),
  }),
});

// TS Type Interfaces (Best Practice for Controllers)
export type RegisterInputType = z.infer<typeof registerSchema>['body'];
export type LoginInputType = z.infer<typeof loginSchema>['body'];
export type RefreshInputType = z.infer<typeof refreshSchema>['body'];
export type RevokeInputType = z.infer<typeof revokeSchema>['body'];
