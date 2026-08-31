import prisma from "../../config/database";
import { uploadImage, uploadVideo, destroyAsset } from "../../utils/cloudinaryHelper";
import { transformRider, transformUrlItem } from "../../utils/transformers";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import slugify from "slugify";

const riderInclude = {
    images: { orderBy: { order: "asc" as const } },
};

export const getRiders = async (query: { page?: string; limit?: string }) => {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "12");
    const { take, skip } = getPagination(page, limit);

    const where = { isActive: true };

    const [riders, total] = await Promise.all([
        prisma.rider.findMany({
            where,
            include: riderInclude,
            orderBy: { createdAt: "desc" },
            take,
            skip,
        }),
        prisma.rider.count({ where }),
    ]);

    return {
        riders: riders.map(transformRider),
        meta: getPaginationMeta(total, page, limit),
    };
};

export const getRiderById = async (id: string) => {
    const rider = await prisma.rider.findUnique({
        where: { id },
        include: riderInclude,
    });

    if (!rider) throw { status: 404, message: "Rider not found" };

    return transformRider(rider);
};

export const createRider = async (data: {
    name: string;
    location: string;
    bio: string;
    boardModel?: string;
    instagram?: string;
}) => {
    const result = await prisma.rider.create({
        data: {
            name: data.name,
            location: data.location,
            bio: data.bio,
            boardModel: data.boardModel || null,
            instagram: data.instagram || null,
        },
        include: riderInclude,
    });
    return transformRider(result);
};

export const updateRider = async (
    id: string,
    data: {
        name?: string;
        location?: string;
        bio?: string;
        isActive?: boolean;
        boardModel?: string;
        instagram?: string;
    }
) => {
    const rider = await prisma.rider.findUnique({ where: { id } });
    if (!rider) throw { status: 404, message: "Rider not found" };

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.boardModel !== undefined) updateData.boardModel = data.boardModel;
    if (data.instagram !== undefined) updateData.instagram = data.instagram;

    const result = await prisma.rider.update({
        where: { id },
        data: updateData,
        include: riderInclude,
    });

    return transformRider(result);
};

export const deleteRider = async (id: string) => {
    const rider = await prisma.rider.findUnique({
        where: { id },
        include: { images: true },
    });
    if (!rider) throw { status: 404, message: "Rider not found" };

    for (const image of rider.images) {
        await destroyAsset(image.url, "image");
    }
    await destroyAsset(rider.videoUrl, "video");

    await prisma.rider.delete({ where: { id } });
    return { message: "Rider deleted successfully" };
};

export const uploadRiderImages = async (
    riderId: string,
    files: Express.Multer.File[]
) => {
    const rider = await prisma.rider.findUnique({ where: { id: riderId } });
    if (!rider) throw { status: 404, message: "Rider not found" };

    const nameSlug = slugify(rider.name, { lower: true, strict: true });
    const uploadedImages = [];

    const lastImage = await prisma.riderImage.findFirst({
        where: { riderId },
        orderBy: { order: "desc" },
    });
    const startOrder = lastImage ? lastImage.order + 1 : 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const result = await uploadImage(
            file.buffer,
            `surf-store/riders/${nameSlug}`
        );

        const image = await prisma.riderImage.create({
            data: {
                riderId,
                url: result.secure_url,
                order: startOrder + i,
            },
        });

        uploadedImages.push(transformUrlItem(image));
    }

    return uploadedImages;
};

export const uploadRiderVideo = async (
    id: string,
    file: Express.Multer.File
) => {
    const rider = await prisma.rider.findUnique({ where: { id } });
    if (!rider) throw { status: 404, message: "Rider not found" };

    await destroyAsset(rider.videoUrl, "video");

    const nameSlug = slugify(rider.name, { lower: true, strict: true });

    const result = await uploadVideo(
        file.buffer,
        `surf-store/riders/${nameSlug}`
    );

    const updated = await prisma.rider.update({
        where: { id },
        data: { videoUrl: result.secure_url },
        include: riderInclude,
    });

    return transformRider(updated);
};

export const deleteRiderVideo = async (id: string) => {
    const rider = await prisma.rider.findUnique({ where: { id } });
    if (!rider) throw { status: 404, message: "Rider not found" };

    if (!rider.videoUrl) {
        throw { status: 400, message: "Rider has no video to delete" };
    }

    await destroyAsset(rider.videoUrl, "video");

    const updated = await prisma.rider.update({
        where: { id },
        data: { videoUrl: null },
        include: riderInclude,
    });

    return transformRider(updated);
};

export const deleteRiderImage = async (riderId: string, imageId: string) => {
    const image = await prisma.riderImage.findUnique({
        where: { id: imageId },
    });
    if (!image) throw { status: 404, message: "Image not found" };

    if (image.riderId !== riderId) {
        throw { status: 400, message: "Image does not belong to this rider" };
    }

    await destroyAsset(image.url, "image");
    await prisma.riderImage.delete({ where: { id: imageId } });

    return { message: "Image deleted successfully" };
};
