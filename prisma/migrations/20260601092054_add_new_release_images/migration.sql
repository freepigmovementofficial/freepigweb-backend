-- CreateTable
CREATE TABLE "new_release_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "new_release_id" TEXT NOT NULL,

    CONSTRAINT "new_release_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "new_release_images" ADD CONSTRAINT "new_release_images_new_release_id_fkey" FOREIGN KEY ("new_release_id") REFERENCES "new_releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
