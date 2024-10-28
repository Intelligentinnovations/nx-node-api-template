import { z } from 'zod';

export const schema = {
  PORT: z.coerce.number().optional(),
  REDIS_URL: z.string().optional(),
  SECRET_KEY: z.string(),
  DATABASE_URL: z.string()
} as const;

export const objectSchema = z.object(schema);
