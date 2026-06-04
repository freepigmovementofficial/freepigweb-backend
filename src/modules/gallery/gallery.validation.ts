import { z } from "zod";

export const galleryQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
    }),
});

export const updateGallerySchema = z.object({
    body: z.object({
        caption: z.string().nullable().optional(),
    }),
});
