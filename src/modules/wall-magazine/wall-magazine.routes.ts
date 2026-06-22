import { Router } from "express";
import {
    getActive,
    index,
    store,
    update,
    destroy,
    uploadImage,
    toggle,
} from "./wall-magazine.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/role.middleware";

import {
    createWallMagazineSchema,
    updateWallMagazineSchema,
} from "./wall-magazine.validation";
import { upload, handleUploadError } from "../../middlewares/upload.middleware";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

// Public
router.get("/active", getActive);

// Admin only
router.get("/", authenticate, requireAdmin, index);
router.post("/", authenticate, requireAdmin, validate(createWallMagazineSchema), store);
router.put("/:id", authenticate, requireAdmin, validate(updateWallMagazineSchema), update);
router.delete("/:id", authenticate, requireAdmin, destroy);
router.post("/:id/image", authenticate, requireAdmin, upload.single("image"), handleUploadError, uploadImage);
router.patch("/:id/toggle", authenticate, requireAdmin, toggle);

export default router;
