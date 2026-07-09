import { z } from "zod";

export const createHeroSchema = z.object({
  body: z.object({
    titlePrimary: z.string().min(1, "Title primary is required"),
    titleSecondary: z.string().min(1, "Title secondary is required"),
    subtitle: z.string().min(2, "Subtitle must be at least 2 characters"),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateHeroSchema = z.object({
  body: z.object({
    titlePrimary: z.string().min(1).optional(),
    titleSecondary: z.string().min(1).optional(),
    subtitle: z
      .string()
      .min(2, "Subtitle must be at least 2 characters")
      .optional(),
    description: z.string().optional().nullable(),
  }),
});
