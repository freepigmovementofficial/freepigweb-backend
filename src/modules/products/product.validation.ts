import { z } from "zod";

const SkillLevelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "GROMS"]);
const WaveLevelEnum = z.enum(["SMALL", "MEDIUM", "BIG", "WAVE_POOL"]);
const ProductTypeEnum = z.enum(["SURFBOARD", "ACCESSORY"]);

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    productType: ProductTypeEnum.default("SURFBOARD"),
    categoryId: z.string().uuid("Invalid category ID").optional(),
    skillLevel: SkillLevelEnum.optional(),
    waveLevels: z.array(WaveLevelEnum).optional(),
    dimensions: z.array(z.object({
      size: z.string(),
      width: z.string(),
      thickness: z.string(),
      volume: z.string().optional(),
    })).optional(),
  }).refine((data) => {
    if (data.productType === "ACCESSORY" && !data.categoryId) {
      return false
    }
    return true
  }, {
    message: "Category is required for accessories",
    path: ["categoryId"]
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    productType: ProductTypeEnum.optional(),
    videoUrl: z.string().url().optional().nullable(),
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
    productType: ProductTypeEnum.optional(),
  }),
});