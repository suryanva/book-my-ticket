import { z } from "zod";

export const bookSeatSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
    name: z.string().min(3).max(50) // Basic format check before the DB check
  })
});