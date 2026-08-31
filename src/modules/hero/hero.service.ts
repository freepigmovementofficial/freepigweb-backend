import prisma from "../../config/database";
import { uploadVideo, destroyAsset } from "../../utils/cloudinaryHelper";

export const getActiveHeroSection = async () => {
  const active = await prisma.heroSection.findFirst({
    where: { isActive: true },
  });

  if (!active) throw { status: 404, message: "No active hero section found" };

  return active;
};

export const getAllHeroSections = async () => {
  return prisma.heroSection.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const createHeroSection = async (data: {
  titlePrimary: string;
  titleSecondary: string;
  subtitle: string;
  description?: string;
  isActive?: boolean;
}) => {
  const isActive = data.isActive ?? false;

  if (isActive) {
    await prisma.heroSection.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  const heroSection = await prisma.heroSection.create({
    data: {
      titlePrimary: data.titlePrimary,
      titleSecondary: data.titleSecondary,
      subtitle: data.subtitle,
      description: data.description || null,
      isActive,
    },
  });

  return heroSection;
};

export const updateHeroSection = async (
  id: string,
  data: {
    titlePrimary?: string;
    titleSecondary?: string;
    subtitle?: string;
    description?: string;
  },
) => {
  const existing = await prisma.heroSection.findUnique({ where: { id } });
  if (!existing) throw { status: 404, message: "Hero section not found" };

  const updated = await prisma.heroSection.update({
    where: { id },
    data,
  });

  return updated;
};

export const deleteHeroSection = async (id: string) => {
  const existing = await prisma.heroSection.findUnique({ where: { id } });
  if (!existing) throw { status: 404, message: "Hero section not found" };

  await destroyAsset(existing.videoUrl, "video");
  await prisma.heroSection.delete({ where: { id } });

  return { message: "Hero section deleted successfully" };
};

export const uploadHeroVideo = async (
  id: string,
  file: Express.Multer.File,
) => {
  const existing = await prisma.heroSection.findUnique({ where: { id } });
  if (!existing) throw { status: 404, message: "Hero section not found" };

  // Delete old video before uploading new one
  await destroyAsset(existing.videoUrl, "video");

  const result = await uploadVideo(file.buffer, "surf-store/hero");

  const updated = await prisma.heroSection.update({
    where: { id },
    data: { videoUrl: result.secure_url },
  });

  return updated;
};

export const toggleHeroActive = async (id: string) => {
  const existing = await prisma.heroSection.findUnique({ where: { id } });
  if (!existing) throw { status: 404, message: "Hero section not found" };

  const newStatus = !existing.isActive;

  if (newStatus) {
    await prisma.heroSection.updateMany({
      where: { id: { not: id }, isActive: true },
      data: { isActive: false },
    });
  }

  const updated = await prisma.heroSection.update({
    where: { id },
    data: { isActive: newStatus },
  });

  return updated;
};
