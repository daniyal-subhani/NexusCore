import { z } from '@nexus-core/common';

export const registerSchema = {
  body: z.object({
    email: z.email(),
    password: z.string().min(8).max(72),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
};

export const refreshSchema = {
  body: z.object({
    refreshToken: z.string().min(1),
  }),
};

export const revokeSchema = {
  body: z.object({
    userId: z.uuid()
  })
}

export type RegisterInput = z.infer<typeof registerSchema.body>;
export type LoginInput = z.infer<typeof loginSchema.body>;
export type RefreshInput = z.infer<typeof refreshSchema.body>;
export type RevokeInput = z.infer<typeof revokeSchema.body>