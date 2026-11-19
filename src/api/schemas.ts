import { z } from 'zod'
import type { LoginResponse, Product, User } from './types'

const roleSchema = z.enum(['USER', 'ADMIN'])

export const userSchema = z.object({
  id: z.number().int().positive(),
  email: z.email(),
  name: z.string().min(1),
  role: roleSchema,
}) satisfies z.ZodType<User>

export const productSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.string().regex(/^-?\d+(?:\.\d+)?$/, 'Expected a decimal string'),
  createdAt: z.string().min(1),
}) satisfies z.ZodType<Product>

export const loginResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
  user: userSchema,
}) satisfies z.ZodType<LoginResponse>

export const refreshResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
})

export const productsResponseSchema = z.object({ products: z.array(productSchema) })
export const userResponseSchema = z.object({ user: userSchema })
