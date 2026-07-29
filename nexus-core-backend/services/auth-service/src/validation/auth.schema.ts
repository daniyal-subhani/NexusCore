import { z } from '@nexus-core/common';

export const registerSchema = z.object({
  body: z.object({
    email: z.email('Please provide a valid email address.'),
    password: z.string().min(8, 'Password must b 8 characters long.'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email('Please provide a valid email address.'),
    password: z.string().min(1, 'Password is required.'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Resfresh token is required.")
  })
})

export const revokeToken = z.object({
  body: z.object({
    userId: z.uuid("Invalid User ID format")
  })
})

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshInput = z.infer<typeof refreshSchema>["body"];
export type RevokeInput = z.infer<typeof revokeToken>["body"]