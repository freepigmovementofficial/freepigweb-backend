-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SURFBOARD', 'ACCESSORY');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "product_type" "ProductType" NOT NULL DEFAULT 'SURFBOARD',
ALTER COLUMN "skill_level" DROP NOT NULL;
