import { z } from "zod";

export const createWallMagazineSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        buttonText: z.string().optional(),
        buttonLink: z.string().optional(),
        isActive: z.boolean().optional(),
    }),
});

export const updateWallMagazineSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required").optional(),
        description: z.string().min(1, "Description is required").optional(),
        buttonText: z.string().optional().nullable(),
        buttonLink: z.string().optional().nullable(),
    }),
});
