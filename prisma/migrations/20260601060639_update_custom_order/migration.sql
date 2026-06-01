/*
  Warnings:

  - You are about to drop the column `board_length` on the `custom_orders` table. All the data in the column will be lost.
  - You are about to drop the column `fitness_level` on the `custom_orders` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `custom_orders` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `custom_orders` table. All the data in the column will be lost.
  - You are about to drop the column `surfing_level` on the `custom_orders` table. All the data in the column will be lost.
  - You are about to drop the column `wave_type` on the `custom_orders` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `custom_orders` table. All the data in the column will be lost.
  - Added the required column `enquiry` to the `custom_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `custom_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `custom_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `custom_orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "custom_orders" DROP COLUMN "board_length",
DROP COLUMN "fitness_level",
DROP COLUMN "height",
DROP COLUMN "notes",
DROP COLUMN "surfing_level",
DROP COLUMN "wave_type",
DROP COLUMN "weight",
ADD COLUMN     "enquiry" TEXT NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;
