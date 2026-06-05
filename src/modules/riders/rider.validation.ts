import { z } from "zod";

export const createRiderSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        location: z.string().min(2),
        bio: z.string().min(10),
        boardModel: z.string().optional(),
        instagram: z.string().optional(),
    }),
});

export const updateRiderSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        location: z.string().min(2).optional(),
        bio: z.string().min(10).optional(),
        boardModel: z.string().optional().nullable(),
        instagram: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
    }),
});

export const riderQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
    }),
});
