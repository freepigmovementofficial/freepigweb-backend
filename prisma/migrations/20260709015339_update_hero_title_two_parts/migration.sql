/*
  Warnings:

  - You are about to drop the column `title` on the `hero_sections` table. All the data in the column will be lost.
  - Added the required column `title_primary` to the `hero_sections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_secondary` to the `hero_sections` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hero_sections" DROP COLUMN "title",
ADD COLUMN     "title_primary" TEXT NOT NULL DEFAULT 'Title Primary',
ADD COLUMN     "title_secondary" TEXT NOT NULL DEFAULT 'Title Secondary';

