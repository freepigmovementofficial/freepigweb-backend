import prisma from "../../config/database";
import cloudinary from "../../config/cloudinary";

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

    return active;
};

export const getAllNewReleases = async () => {
    return prisma.newRelease.findMany({
        include: newReleaseInclude,
        orderBy: { createdAt: "desc" },
    });
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

    return newRelease;
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

    return updated;
};

export const deleteNewRelease = async (id: string) => {
    const existing = await prisma.newRelease.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "New release not found" };

    if (existing.videoUrl && existing.videoUrl.includes("cloudinary.com")) {
        try {
            const publicId = existing.videoUrl
                .split("/")
                .slice(-3)
                .join("/")
                .split(".")[0];
            await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        } catch (err) {
            console.error("Failed to delete video from Cloudinary:", err);
        }
    }

    await prisma.newRelease.delete({ where: { id } });
    return { message: "New release deleted successfully" };
};

export const uploadNewReleaseVideo = async (
    id: string,
    file: Express.Multer.File
) => {
    const existing = await prisma.newRelease.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "New release not found" };

    // Hapus video lama dari Cloudinary kalau ada
    if (existing.videoUrl && existing.videoUrl.includes("cloudinary.com")) {
        try {
            const publicId = existing.videoUrl
                .split("/")
                .slice(-3)
                .join("/")
                .split(".")[0];
            await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        } catch (err) {
            console.error("Failed to delete old video:", err);
        }
    }

    const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "surf-store/new-releases",
                resource_type: "video",
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(file.buffer);
    });

    const updated = await prisma.newRelease.update({
        where: { id },
        data: { videoUrl: result.secure_url },
        include: newReleaseInclude,
    });

    return updated;
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

    return updated;
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

        const result = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "surf-store/new-releases",
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(file.buffer);
        });

        const image = await prisma.newReleaseImage.create({
            data: {
                newReleaseId: id,
                url: result.secure_url,
                order: startOrder + i,
            },
        });

        uploadedImages.push(image);
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

    const publicId = image.url.split("/").slice(-3).join("/").split(".")[0];
    await cloudinary.uploader.destroy(publicId);

    await prisma.newReleaseImage.delete({ where: { id: imageId } });
    return { message: "Image deleted successfully" };
};