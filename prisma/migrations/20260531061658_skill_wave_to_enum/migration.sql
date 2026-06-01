/*
  Warnings:

  - You are about to drop the `product_skill_levels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_wave_levels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `skill_levels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wave_levels` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `skill_level` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('GROMS', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "WaveLevel" AS ENUM ('SMALL', 'MEDIUM', 'BIG');

-- DropForeignKey
ALTER TABLE "product_skill_levels" DROP CONSTRAINT "product_skill_levels_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_skill_levels" DROP CONSTRAINT "product_skill_levels_skill_level_id_fkey";

-- DropForeignKey
ALTER TABLE "product_wave_levels" DROP CONSTRAINT "product_wave_levels_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_wave_levels" DROP CONSTRAINT "product_wave_levels_wave_level_id_fkey";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "skill_level" "SkillLevel" NOT NULL,
ADD COLUMN     "wave_levels" "WaveLevel"[];

-- DropTable
DROP TABLE "product_skill_levels";

-- DropTable
DROP TABLE "product_wave_levels";

-- DropTable
DROP TABLE "skill_levels";

-- DropTable
DROP TABLE "wave_levels";
