-- CreateTable
CREATE TABLE "magazines" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL,
    "button_text" TEXT NOT NULL,
    "button_link" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "magazines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magazine_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "magazine_id" TEXT NOT NULL,

    CONSTRAINT "magazine_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "magazine_images" ADD CONSTRAINT "magazine_images_magazine_id_fkey" FOREIGN KEY ("magazine_id") REFERENCES "magazines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
