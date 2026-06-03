-- CreateTable
CREATE TABLE "featured_sections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_products" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "featured_section_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "featured_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "featured_products_featured_section_id_product_id_key" ON "featured_products"("featured_section_id", "product_id");

-- AddForeignKey
ALTER TABLE "featured_products" ADD CONSTRAINT "featured_products_featured_section_id_fkey" FOREIGN KEY ("featured_section_id") REFERENCES "featured_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_products" ADD CONSTRAINT "featured_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
