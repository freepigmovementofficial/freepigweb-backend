import prisma from "../../config/database";

const featuredProductInclude = {
    product: {
        include: {
            images: {
                orderBy: [
                    { isPrimary: "desc" as const },
                    { order: "asc" as const },
                ],
            },
            category: true,
        },
    },
};

const featuredSectionInclude = {
    products: {
        orderBy: { order: "asc" as const },
        include: featuredProductInclude,
    },
};

export const getActiveFeaturedSection = async () => {
    const active = await prisma.featuredSection.findFirst({
        where: { isActive: true },
        include: featuredSectionInclude,
    });

    if (!active) throw { status: 404, message: "No active featured section found" };

    return active;
};

export const getAllFeaturedSections = async () => {
    return prisma.featuredSection.findMany({
        include: featuredSectionInclude,
        orderBy: { createdAt: "desc" },
    });
};

export const createFeaturedSection = async (data: { title: string }) => {
    const section = await prisma.featuredSection.create({
        data: { title: data.title },
        include: featuredSectionInclude,
    });

    return section;
};

export const updateFeaturedSection = async (id: string, data: { title: string }) => {
    const existing = await prisma.featuredSection.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Featured section not found" };

    const updated = await prisma.featuredSection.update({
        where: { id },
        data: { title: data.title },
        include: featuredSectionInclude,
    });

    return updated;
};

export const deleteFeaturedSection = async (id: string) => {
    const existing = await prisma.featuredSection.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Featured section not found" };

    await prisma.featuredSection.delete({ where: { id } });
    return { message: "Featured section deleted successfully" };
};

export const setFeaturedProducts = async (id: string, productIds: string[]) => {
    const existing = await prisma.featuredSection.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Featured section not found" };

    // Validate all product IDs exist
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
    });

    if (products.length !== productIds.length) {
        const foundIds = products.map((p) => p.id);
        const notFoundIds = productIds.filter((pid) => !foundIds.includes(pid));
        throw {
            status: 400,
            message: `Products not found: ${notFoundIds.join(", ")}`,
        };
    }

    // Replace all featured products using transaction
    const result = await prisma.$transaction(async (tx) => {
        await tx.featuredProduct.deleteMany({
            where: { featuredSectionId: id },
        });

        await tx.featuredProduct.createMany({
            data: productIds.map((productId, index) => ({
                featuredSectionId: id,
                productId,
                order: index,
            })),
        });

        return tx.featuredSection.findUnique({
            where: { id },
            include: featuredSectionInclude,
        });
    });

    return result;
};

export const removeFeaturedProduct = async (id: string, productId: string) => {
    const existing = await prisma.featuredProduct.findFirst({
        where: { featuredSectionId: id, productId },
    });

    if (!existing) {
        throw { status: 404, message: "Product not found in this featured section" };
    }

    await prisma.featuredProduct.delete({ where: { id: existing.id } });
    return { message: "Product removed from featured section" };
};

export const toggleFeaturedSectionActive = async (id: string) => {
    const existing = await prisma.featuredSection.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Featured section not found" };

    const newStatus = !existing.isActive;

    if (newStatus) {
        // Deactivate all other sections first
        await prisma.featuredSection.updateMany({
            where: { id: { not: id }, isActive: true },
            data: { isActive: false },
        });
    }

    const updated = await prisma.featuredSection.update({
        where: { id },
        data: { isActive: newStatus },
        include: featuredSectionInclude,
    });

    return updated;
};
