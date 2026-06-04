import prisma from "../../config/database";
import cloudinary from "../../config/cloudinary";
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
        galleries,
        meta: getPaginationMeta(total, page, limit),
    };
};

export const createGalleries = async (files: Express.Multer.File[]) => {
    // Ambil order terakhir yang ada di database
    const lastGallery = await prisma.gallery.findFirst({
        orderBy: { order: "desc" },
    });
    const startOrder = lastGallery ? lastGallery.order + 1 : 0;

    const uploadedGalleries = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const result = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "surf-store/gallery",
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(file.buffer);
        });

        const gallery = await prisma.gallery.create({
            data: {
                url: result.secure_url,
                order: startOrder + i,
            },
        });

        uploadedGalleries.push(gallery);
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

    return updated;
};

export const deleteGallery = async (id: string) => {
    const gallery = await prisma.gallery.findUnique({ where: { id } });
    if (!gallery) throw { status: 404, message: "Gallery not found" };

    const urlParts = gallery.url.split("/");
    const fileName = urlParts[urlParts.length - 1].split(".")[0];
    const folder = urlParts.slice(-3, -1).join("/");
    const publicId = `${folder}/${fileName}`;
    await cloudinary.uploader.destroy(publicId);

    await prisma.gallery.delete({ where: { id } });

    return { message: "Gallery deleted successfully" };
};
