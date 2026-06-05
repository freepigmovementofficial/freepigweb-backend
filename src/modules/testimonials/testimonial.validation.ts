import { z } from "zod";

export const testimonialQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
    }),
});

export const createTestimonialSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        review: z.string().min(1, "Review is required"),
        instagram: z.string().optional().nullable(),
        order: z.number().int().optional(),
        isActive: z.boolean().optional(),
    }),
});

export const updateTestimonialSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required").optional(),
        review: z.string().min(1, "Review is required").optional(),
        instagram: z.string().optional().nullable(),
        order: z.number().int().optional(),
        isActive: z.boolean().optional(),
    }),
});
