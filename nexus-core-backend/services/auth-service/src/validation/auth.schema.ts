import { z } from '@nexus-core/common';

export const RegisterSchema = z.object({
  body: z.object({
    email: z.email('Please provide a valid email address.'),
    password: z.string().min(8, 'Password must b 8 characters long.'),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.email('Please provide a valid email address.'),
    password: z.string().min(1, 'Password is required.'),
  }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>['body'];
export type LoginInput = z.infer<typeof LoginSchema>['body'];
