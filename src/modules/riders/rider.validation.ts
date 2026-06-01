import { z } from "zod";

export const createRiderSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        location: z.string().min(2, "Location must be at least 2 characters"),
        bio: z.string().min(10, "Bio must be at least 10 characters"),
    }),
});

export const updateRiderSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters").optional(),
        location: z.string().min(2, "Location must be at least 2 characters").optional(),
        bio: z.string().min(10, "Bio must be at least 10 characters").optional(),
        isActive: z.boolean().optional(),
    }),
});

export const riderQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
    }),
});
