/*
  Warnings:

  - You are about to drop the `new_release_products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "new_release_products" DROP CONSTRAINT "new_release_products_new_release_id_fkey";

-- DropForeignKey
ALTER TABLE "new_release_products" DROP CONSTRAINT "new_release_products_product_id_fkey";

-- AlterTable
ALTER TABLE "new_releases" ADD COLUMN     "product_id" TEXT;

-- DropTable
DROP TABLE "new_release_products";

-- AddForeignKey
ALTER TABLE "new_releases" ADD CONSTRAINT "new_releases_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
