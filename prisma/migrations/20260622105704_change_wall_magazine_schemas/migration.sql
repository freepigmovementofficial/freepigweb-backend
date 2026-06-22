/*
  Warnings:

  - You are about to drop the `magazine_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `magazines` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "magazine_images" DROP CONSTRAINT "magazine_images_magazine_id_fkey";

-- DropTable
DROP TABLE "magazine_images";

-- DropTable
DROP TABLE "magazines";

-- CreateTable
CREATE TABLE "wall_magazines" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "button_text" TEXT,
    "button_link" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wall_magazines_pkey" PRIMARY KEY ("id")
);
