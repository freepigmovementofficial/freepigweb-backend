import prisma from "../../config/database";
import { uploadImage, destroyAsset } from "../../utils/cloudinaryHelper";
import { transformUrlItem, transformGalleryItem } from "../../utils/transformers";
import { getPagination, getPaginationMeta } from "../../utils/pagination";

export const getGalleries = async (query: { page?: string; limit?: string }) => {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "12");
    const { take, skip } = getPagination(page, limit);

    const [galleries, total] = await Promise.all([
        prisma.gallery.findMany({
            orderBy: { order: "asc" },
            take,
            skip,
        }),
        prisma.gallery.count(),
    ]);

    return {
        galleries: galleries.map(transformGalleryItem),
        meta: getPaginationMeta(total, page, limit),
    };
};

export const createGalleries = async (files: Express.Multer.File[]) => {
    const lastGallery = await prisma.gallery.findFirst({
        orderBy: { order: "desc" },
    });
    const startOrder = lastGallery ? lastGallery.order + 1 : 0;

    const uploadedGalleries = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const result = await uploadImage(file.buffer, "surf-store/gallery");

        const gallery = await prisma.gallery.create({
            data: {
                url: result.secure_url,
                order: startOrder + i,
            },
        });

        uploadedGalleries.push(transformUrlItem(gallery));
    }

    return uploadedGalleries;
};

export const updateGallery = async (
    id: string,
    data: { caption?: string | null }
) => {
    const gallery = await prisma.gallery.findUnique({ where: { id } });
    if (!gallery) throw { status: 404, message: "Gallery not found" };

    const updated = await prisma.gallery.update({
        where: { id },
        data: {
            caption: data.caption !== undefined ? data.caption : gallery.caption,
        },
    });

    return transformUrlItem(updated);
};

export const deleteGallery = async (id: string) => {
    const gallery = await prisma.gallery.findUnique({ where: { id } });
    if (!gallery) throw { status: 404, message: "Gallery not found" };

    await destroyAsset(gallery.url, "image");
    await prisma.gallery.delete({ where: { id } });

    return { message: "Gallery deleted successfully" };
};
