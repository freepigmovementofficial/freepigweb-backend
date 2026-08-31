import prisma from "../../config/database";
import { uploadImage, uploadVideo, destroyAsset } from "../../utils/cloudinaryHelper";
import { transformNewRelease, transformUrlItem } from "../../utils/transformers";

const newReleaseInclude = {
    product: {
        include: {
            images: { orderBy: { order: "asc" as const } },
            category: true,
        },
    },
    images: { orderBy: { order: "asc" as const } },
};

export const getActiveNewRelease = async () => {
    const active = await prisma.newRelease.findFirst({
        where: { isActive: true },
        include: newReleaseInclude,
    });

    if (!active) throw { status: 404, message: "No active new release found" };

    return transformNewRelease(active);
};

export const getAllNewReleases = async () => {
    const results = await prisma.newRelease.findMany({
        include: newReleaseInclude,
        orderBy: { createdAt: "desc" },
    });
    return results.map(transformNewRelease);
};

export const createNewRelease = async (data: {
    title: string;
    description: string;
    videoUrl?: string;
    productId?: string;
    isActive?: boolean;
}) => {
    const isActive = data.isActive ?? false;

    if (isActive) {
        await prisma.newRelease.updateMany({
            where: { isActive: true },
            data: { isActive: false },
        });
    }

    const newRelease = await prisma.newRelease.create({
        data: {
            title: data.title,
            description: data.description,
            videoUrl: data.videoUrl || "",
            productId: data.productId || null,
            isActive,
        },
        include: newReleaseInclude,
    });

    return transformNewRelease(newRelease);
};

export const updateNewRelease = async (
    id: string,
    data: {
        title?: string;
        description?: string;
        productId?: string;
    }
) => {
    const existing = await prisma.newRelease.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "New release not found" };

    const updated = await prisma.newRelease.update({
        where: { id },
        data,
        include: newReleaseInclude,
    });

    return transformNewRelease(updated);
};

export const deleteNewRelease = async (id: string) => {
    const existing = await prisma.newRelease.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "New release not found" };

    await destroyAsset(existing.videoUrl, "video");
    await prisma.newRelease.delete({ where: { id } });

    return { message: "New release deleted successfully" };
};

export const uploadNewReleaseVideo = async (
    id: string,
    file: Express.Multer.File
) => {
    const existing = await prisma.newRelease.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "New release not found" };

    await destroyAsset(existing.videoUrl, "video");

    const result = await uploadVideo(file.buffer, "surf-store/new-releases");

    const updated = await prisma.newRelease.update({
        where: { id },
        data: { videoUrl: result.secure_url },
        include: newReleaseInclude,
    });

    return transformNewRelease(updated);
};

export const toggleNewReleaseActive = async (id: string) => {
    const existing = await prisma.newRelease.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "New release not found" };

    const newStatus = !existing.isActive;

    if (newStatus) {
        await prisma.newRelease.updateMany({
            where: { id: { not: id }, isActive: true },
            data: { isActive: false },
        });
    }

    const updated = await prisma.newRelease.update({
        where: { id },
        data: { isActive: newStatus },
        include: newReleaseInclude,
    });

    return transformNewRelease(updated);
};

export const uploadNewReleaseImages = async (
    id: string,
    files: Express.Multer.File[]
) => {
    const existing = await prisma.newRelease.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "New release not found" };

    const lastImage = await prisma.newReleaseImage.findFirst({
        where: { newReleaseId: id },
        orderBy: { order: "desc" },
    });
    const startOrder = lastImage ? lastImage.order + 1 : 0;

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const result = await uploadImage(file.buffer, "surf-store/new-releases");

        const image = await prisma.newReleaseImage.create({
            data: {
                newReleaseId: id,
                url: result.secure_url,
                order: startOrder + i,
            },
        });

        uploadedImages.push(transformUrlItem(image));
    }

    return uploadedImages;
};

export const deleteNewReleaseImage = async (id: string, imageId: string) => {
    const image = await prisma.newReleaseImage.findUnique({
        where: { id: imageId },
    });
    if (!image) throw { status: 404, message: "Image not found" };

    if (image.newReleaseId !== id) {
        throw { status: 400, message: "Image does not belong to this new release" };
    }

    await destroyAsset(image.url, "image");
    await prisma.newReleaseImage.delete({ where: { id: imageId } });

    return { message: "Image deleted successfully" };
};

export const uploadNewReleaseLogo = async (
    id: string,
    file: Express.Multer.File
) => {
    const existing = await prisma.newRelease.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "New release not found" };

    await destroyAsset(existing.logoUrl, "image");

    const result = await uploadImage(file.buffer, "surf-store/new-releases");

    const updated = await prisma.newRelease.update({
        where: { id },
        data: { logoUrl: result.secure_url },
        include: newReleaseInclude,
    });

    return transformNewRelease(updated);
};
