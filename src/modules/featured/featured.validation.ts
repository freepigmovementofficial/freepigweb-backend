import { z } from "zod";

export const createFeaturedSectionSchema = z.object({
    body: z.object({
        title: z.string().min(2, "Title must be at least 2 characters"),
    }),
});

export const updateFeaturedSectionSchema = z.object({
    body: z.object({
        title: z.string().min(2, "Title must be at least 2 characters"),
    }),
});

export const setFeaturedProductsSchema = z.object({
    body: z.object({
        productIds: z
            .array(z.string().uuid("Invalid product ID"))
            .min(1, "At least one product ID is required"),
    }),
});
