import prisma from "../../config/database";

export const toggleWishlist = async (userId: string, productId: string) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });
    if (!product || !product.isActive) {
        throw { status: 404, message: "Product not found" };
    }

    const existing = await prisma.wishlist.findUnique({
        where: { userId_productId: { userId, productId } },
    });

    if (existing) {
        await prisma.wishlist.delete({
            where: { id: existing.id },
        });
        return { action: "removed" as const };
    }

    const wishlist = await prisma.wishlist.create({
        data: { userId, productId },
        include: {
            product: {
                include: {
                    images: true,
                    category: true,
                },
            },
        },
    });

    return { action: "added" as const, wishlist };
};

export const getUserWishlists = async (userId: string) => {
    const wishlists = await prisma.wishlist.findMany({
        where: { userId },
        include: {
            product: {
                include: {
                    images: true,
                    category: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return wishlists;
};

export const checkWishlist = async (userId: string, productId: string) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });
    if (!product || !product.isActive) {
        throw { status: 404, message: "Product not found" };
    }

    const existing = await prisma.wishlist.findUnique({
        where: { userId_productId: { userId, productId } },
    });

    return { isWishlisted: !!existing };
};
