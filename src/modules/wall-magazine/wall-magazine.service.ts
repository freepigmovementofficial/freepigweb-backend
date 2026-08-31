import prisma from "../../config/database";
import { uploadImage, destroyAsset } from "../../utils/cloudinaryHelper";
import { transformWallMagazine } from "../../utils/transformers";

export const getActiveWallMagazine = async () => {
    const active = await prisma.wallMagazine.findFirst({
        where: { isActive: true },
    });
    if (!active) throw { status: 404, message: "No active wall magazine found" };
    return transformWallMagazine(active);
};

export const getAllWallMagazines = async () => {
    const results = await prisma.wallMagazine.findMany({
        orderBy: { createdAt: "desc" },
    });
    return results.map(transformWallMagazine);
};

export const createWallMagazine = async (data: {
    title: string;
    description: string;
    buttonText?: string;
    buttonLink?: string;
    isActive?: boolean;
}) => {
    const isActive = data.isActive ?? false;

    if (isActive) {
        await prisma.wallMagazine.updateMany({
            where: { isActive: true },
            data: { isActive: false },
        });
    }

    const result = await prisma.wallMagazine.create({
        data: {
            title: data.title,
            description: data.description,
            buttonText: data.buttonText || null,
            buttonLink: data.buttonLink || null,
            isActive,
        },
    });
    return transformWallMagazine(result);
};

export const updateWallMagazine = async (
    id: string,
    data: {
        title?: string;
        description?: string;
        buttonText?: string | null;
        buttonLink?: string | null;
    }
) => {
    const existing = await prisma.wallMagazine.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Wall magazine not found" };

    const result = await prisma.wallMagazine.update({
        where: { id },
        data,
    });
    return transformWallMagazine(result);
};

export const deleteWallMagazine = async (id: string) => {
    const existing = await prisma.wallMagazine.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Wall magazine not found" };

    await destroyAsset(existing.imageUrl, "image");
    await prisma.wallMagazine.delete({ where: { id } });

    return { message: "Wall magazine deleted successfully" };
};

export const uploadWallMagazineImage = async (id: string, file: Express.Multer.File) => {
    const existing = await prisma.wallMagazine.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Wall magazine not found" };

    await destroyAsset(existing.imageUrl, "image");

    const result = await uploadImage(file.buffer, "surf-store/wall-magazine");

    const updated = await prisma.wallMagazine.update({
        where: { id },
        data: { imageUrl: result.secure_url },
    });
    return transformWallMagazine(updated);
};

export const toggleWallMagazineActive = async (id: string) => {
    const existing = await prisma.wallMagazine.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Wall magazine not found" };

    const newStatus = !existing.isActive;

    if (newStatus) {
        await prisma.wallMagazine.updateMany({
            where: { id: { not: id }, isActive: true },
            data: { isActive: false },
        });
    }

    const result = await prisma.wallMagazine.update({
        where: { id },
        data: { isActive: newStatus },
    });
    return transformWallMagazine(result);
};
