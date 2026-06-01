import { z } from "zod";

const SkillLevelEnum = z.enum(["GROMS", "BEGINNER", "INTERMEDIATE", "ADVANCED"]);
const WaveLevelEnum = z.enum(["SMALL", "MEDIUM", "BIG"]);

export const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        description: z.string().optional(),
        categoryId: z.string().uuid("Invalid category ID"),
        skillLevel: SkillLevelEnum,
        waveLevels: z.array(WaveLevelEnum).min(1, "At least one wave level required"),
        dimensions: z.array(z.object({
            size: z.string(),
            width: z.string(),
            thickness: z.string(),
            volume: z.string().optional(),
        })).optional(),
    }),
});

export const updateProductSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        description: z.string().optional(),
        categoryId: z.string().uuid().optional(),
        skillLevel: SkillLevelEnum.optional(),
        waveLevels: z.array(WaveLevelEnum).optional(),
        isActive: z.boolean().optional(),
    }),
});

export const productQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        categoryId: z.string().optional(),
        skillLevel: SkillLevelEnum.optional(),
        waveLevel: WaveLevelEnum.optional(),
    }),
});