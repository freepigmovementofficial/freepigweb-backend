import { Router } from "express";
import {
    getActive,
    index,
    store,
    update,
    destroy,
    uploadVideo,
    toggle,
    destroyImage,
    uploadImages,
    uploadLogo,
} from "./new-release.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { handleUploadError, upload } from "../../middlewares/upload.middleware";
import { uploadVideo as uploadVideoMiddleware } from "../../middlewares/upload.middleware";
import {
    createNewReleaseSchema,
    updateNewReleaseSchema,
} from "./new-release.validation";

const router = Router();

// Public
router.get("/active", getActive);

// Admin only
router.get("/", authenticate, requireAdmin, index);
router.post("/", authenticate, requireAdmin, validate(createNewReleaseSchema), store);
router.put("/:id", authenticate, requireAdmin, validate(updateNewReleaseSchema), update);
router.delete("/:id", authenticate, requireAdmin, destroy);
router.post("/:id/video", authenticate, requireAdmin, uploadVideoMiddleware.single("video"), handleUploadError, uploadVideo);
router.patch("/:id/toggle", authenticate, requireAdmin, toggle);
router.post("/:id/images", authenticate, requireAdmin, upload.array("images", 2), handleUploadError, uploadImages);
router.delete("/:id/images/:imageId", authenticate, requireAdmin, destroyImage);
router.post("/:id/logo", authenticate, requireAdmin, upload.single("logo"), handleUploadError, uploadLogo);


export default router;