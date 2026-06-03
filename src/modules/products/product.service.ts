import prisma from "../../config/database";
import cloudinary from "../../config/cloudinary";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import { SkillLevel, WaveLevel, ImageType, ProductType } from "@prisma/client";
import slugify from "slugify";

const productInclude = {
    category: true,
    images: { orderBy: { order: "asc" as const } },
    dimensions: true,
    reviews: {
        include: { user: { omit: { password: true } } },
        orderBy: { createdAt: "desc" as const },
    },
    _count: { select: { reviews: true } },
};

const calcAvgRating = (reviews: { rating: number }[]) => {
    if (reviews.length === 0) return 0;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return Math.round(avg * 10) / 10;
};

export const getCategories = async () => {
    return prisma.category.findMany();
};

export const getProducts = async (query: {
    page?: string;
    limit?: string;
    search?: string;
    categoryId?: string;
    skillLevel?: SkillLevel;
    waveLevel?: WaveLevel;
    productType?: ProductType;
}) => {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "12");
    const { take, skip } = getPagination(page, limit);

    const where: any = { isActive: true };

    if (query.search) where.name = { contains: query.search, mode: "insensitive" };
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.skillLevel) where.skillLevel = query.skillLevel;
    if (query.waveLevel) where.waveLevels = { has: query.waveLevel };
    if (query.productType) where.productType = query.productType;

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: productInclude,
            orderBy: { createdAt: "desc" },
            take,
            skip,
        }),
        prisma.product.count({ where }),
    ]);

    const productsWithRating = products.map((p) => ({
        ...p,
        avgRating: calcAvgRating(p.reviews),
    }));

    return {
        products: productsWithRating,
        meta: getPaginationMeta(total, page, limit),
    };
};

export const getProductBySlug = async (slug: string) => {
    const product = await prisma.product.findUnique({
        where: { slug },
        include: productInclude,
    });

    if (!product) throw new Error("Product not found");

    return { ...product, avgRating: calcAvgRating(product.reviews) };
};

export const createProduct = async (data: {
    name: string;
    description?: string;
    productType?: ProductType;
    categoryId: string;
    skillLevel?: SkillLevel;
    waveLevels?: WaveLevel[];
    dimensions?: {
        size: string;
        width: string;
        thickness: string;
        volume?: string;
    }[];
}) => {
    const slug = slugify(data.name, { lower: true, strict: true });

    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    if (existingProduct) throw new Error("Product with this name already exists");

    const product = await prisma.product.create({
         data: {
         name: data.name,
         slug,
         description: data.description,
         productType: data.productType || "SURFBOARD",
         categoryId: data.categoryId,
         skillLevel: data.skillLevel || null,
         waveLevels: data.waveLevels ? { set: data.waveLevels } : { set: [] },
         dimensions: data.dimensions ? { create: data.dimensions } : undefined,
     },
    include: productInclude,
    });

    return product;
};

export const updateProduct = async (
    id: string,
    data: {
        name?: string;
        description?: string;
        categoryId?: string;
        skillLevel?: SkillLevel;
        waveLevels?: WaveLevel[];
        isActive?: boolean;
    }
) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error("Product not found");

    const updateData: any = {};

    if (data.name) {
        updateData.name = data.name;
        updateData.slug = slugify(data.name, { lower: true, strict: true });
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.categoryId) updateData.categoryId = data.categoryId;
    if (data.skillLevel) updateData.skillLevel = data.skillLevel;
    if (data.waveLevels) updateData.waveLevels = data.waveLevels;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await prisma.product.update({
        where: { id },
        data: updateData,
        include: productInclude,
    });

    return updated;
};

export const deleteProduct = async (id: string) => {
    const product = await prisma.product.findUnique({
        where: { id },
        include: { images: true },
    });
    if (!product) throw new Error("Product not found");

    for (const image of product.images) {
        const publicId = image.url.split("/").slice(-3).join("/").split(".")[0];
        await cloudinary.uploader.destroy(publicId);
    }

    await prisma.product.delete({ where: { id } });
    return { message: "Product deleted successfully" };
};

export const uploadProductImages = async (
    productId: string,
    files: Express.Multer.File[],
    types: string[]
) => {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Product not found");

    const lastImage = await prisma.productImage.findFirst({
        where: { productId },
        orderBy: { order: "desc" },
    });
    const startOrder = lastImage ? lastImage.order + 1 : 0;

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageType = (types[i] || "DECK").toUpperCase() as ImageType;

        const result = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `surf-store/products/${product.slug}`,
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(file.buffer);
        });

        const image = await prisma.productImage.create({
            data: {
                productId,
                url: result.secure_url,
                type: imageType,
                order: startOrder + i,
            },
        });

        uploadedImages.push(image);
    }

    return uploadedImages;
};

export const deleteProductImage = async (imageId: string) => {
    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) throw new Error("Image not found");

    const publicId = image.url.split("/").slice(-3).join("/").split(".")[0];
    await cloudinary.uploader.destroy(publicId);

    await prisma.productImage.delete({ where: { id: imageId } });
    return { message: "Image deleted successfully" };
};

export const setProductPrimaryImage = async (productId: string, imageId: string) => {
  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
  });

  if (!image) throw new Error("Image not found");

  if (image.productId !== productId) {
    throw new Error("Image does not belong to this product");
  }

  await prisma.$transaction([
    prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    }),
    prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    }),
  ]);

  return prisma.product.findUnique({
    where: { id: productId },
    include: productInclude,
  });
};

// Manage Dimension
export const addProductDimension = async (
    productId: string,
    data: { size: string; width: string; thickness: string; volume?: string }
) => {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Product not found");

    const dimension = await prisma.productDimension.create({
        data: { productId, ...data },
    });

    return dimension;
};

export const deleteProductDimension = async (dimensionId: string) => {
    const dimension = await prisma.productDimension.findUnique({
        where: { id: dimensionId },
    });
    if (!dimension) throw new Error("Dimension not found");

    await prisma.productDimension.delete({ where: { id: dimensionId } });
    return { message: "Dimension deleted successfully" };
};