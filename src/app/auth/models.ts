import { z } from "zod";

export const signUpPayloadModel = z.object({
  body: z.object({
    full_name: z.string().trim().min(1, "Name is required"),
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8)
  })
});


export const signInPayloadModel = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(6),
  }),
});
