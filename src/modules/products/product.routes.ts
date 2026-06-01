import { Router } from "express";
import {
    index,
    show,
    store,
    update,
    destroy,
    uploadImages,
    destroyImage,
    addDimension,
    destroyDimension,
} from "./product.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { upload, handleUploadError } from "../../middlewares/upload.middleware";
import {
    createProductSchema,
    updateProductSchema,
    productQuerySchema,
} from "./product.validation";
import { getCategories } from "./product.service";
import { sendSuccess } from "../../utils/response";

const router = Router();
router.get("/categories", async (req, res) => {
    const categories = await getCategories();
    return sendSuccess(res, categories, "Categories fetched");
});
router.get("/", validate(productQuerySchema), index);
router.get("/:slug", show);

router.post("/", authenticate, requireAdmin, validate(createProductSchema), store);
router.put("/:id", authenticate, requireAdmin, validate(updateProductSchema), update);
router.delete("/:id", authenticate, requireAdmin, destroy);
router.post("/:id/images", authenticate, requireAdmin, upload.array("images", 10), handleUploadError, uploadImages);
router.delete("/:id/images/:imageId", authenticate, requireAdmin, destroyImage);

router.post("/:id/dimensions", authenticate, requireAdmin, addDimension);
router.delete("/:id/dimensions/:dimensionId", authenticate, requireAdmin, destroyDimension);

export default router;