import { z } from "zod";
import { CustomOrderStatus } from "@prisma/client";

export const adminUserQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
    }),
});

export const adminCustomOrderQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        status: z.nativeEnum(CustomOrderStatus).optional(),
    }),
});

export const updateCustomOrderStatusSchema = z.object({
    body: z.object({
        status: z.enum(["CONFIRMED", "CANCELLED"] as const)
    }),
});

export const adminReviewQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
    }),
});
