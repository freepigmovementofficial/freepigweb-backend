import { z } from "zod";

export const createStoreReviewSchema = z.object({
    body: z.object({
        rating: z
            .number()
            .int("Rating must be an integer")
            .min(1, "Rating must be at least 1")
            .max(5, "Rating must be at most 5"),
        comment: z.string().optional(),
    }),
});

export const updateStoreReviewSchema = z.object({
    body: z.object({
        rating: z
            .number()
            .int("Rating must be an integer")
            .min(1, "Rating must be at least 1")
            .max(5, "Rating must be at most 5")
            .optional(),
        comment: z.string().optional(),
    }),
});

export const storeReviewQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
    }),
});
