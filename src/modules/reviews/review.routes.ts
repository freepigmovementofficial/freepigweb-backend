import { Router } from "express";
import { index, store, update, destroy } from "./review.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
    createReviewSchema,
    updateReviewSchema,
    reviewQuerySchema,
} from "./review.validation";

const router = Router();

router.get("/products/:productId/reviews", validate(reviewQuerySchema), index);
router.post("/products/:productId/reviews", authenticate, validate(createReviewSchema), store);

router.put("/reviews/:id", authenticate, validate(updateReviewSchema), update);
router.delete("/reviews/:id", authenticate, destroy);

export default router;
