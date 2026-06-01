-- CreateTable
CREATE TABLE "new_releases" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "new_releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "new_release_products" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "new_release_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "new_release_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "new_release_products_new_release_id_product_id_key" ON "new_release_products"("new_release_id", "product_id");

-- AddForeignKey
ALTER TABLE "new_release_products" ADD CONSTRAINT "new_release_products_new_release_id_fkey" FOREIGN KEY ("new_release_id") REFERENCES "new_releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "new_release_products" ADD CONSTRAINT "new_release_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
