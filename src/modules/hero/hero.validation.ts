import { z } from "zod";

export const createHeroSchema = z.object({
    body: z.object({
        title: z.string().min(2, "Title must be at least 2 characters"),
        subtitle: z.string().min(2, "Subtitle must be at least 2 characters"),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
    }),
});

export const updateHeroSchema = z.object({
    body: z.object({
        title: z.string().min(2, "Title must be at least 2 characters").optional(),
        subtitle: z.string().min(2, "Subtitle must be at least 2 characters").optional(),
        description: z.string().optional(),
    }),
});
