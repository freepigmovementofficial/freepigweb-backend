import { z } from "zod";

export const createCustomOrderSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        phone: z.string().min(8, "Phone must be at least 8 characters"),
        location: z.string().min(2, "Location must be at least 2 characters"),
        enquiry: z.string().min(10, "Enquiry must be at least 10 characters"),
    }),
});

export const customOrderQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
    }),
});
