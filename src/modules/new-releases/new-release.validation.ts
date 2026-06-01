import { z } from "zod";

export const createNewReleaseSchema = z.object({
    body: z.object({
        title: z.string().min(2, "Title must be at least 2 characters"),
        description: z.string().min(10, "Description must be at least 10 characters"),
        videoUrl: z.string().optional(),
        productId: z.string().uuid("Invalid product ID").optional(),
        isActive: z.boolean().optional(),
    }),
});

export const updateNewReleaseSchema = z.object({
    body: z.object({
        title: z.string().min(2).optional(),
        description: z.string().min(10).optional(),
        productId: z.string().uuid("Invalid product ID").optional(),
    }),
});