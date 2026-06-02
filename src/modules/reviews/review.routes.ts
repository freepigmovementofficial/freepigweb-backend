import { Router } from "express";
import { index, store, update, destroy, latest } from "./review.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
    createReviewSchema,
    updateReviewSchema,
    reviewQuerySchema,
} from "./review.validation";

const router = Router();

// Public: get latest reviews across all products (for homepage)
router.get("/reviews/latest", validate(reviewQuerySchema), latest);

// Product-scoped routes → mounted at /products/:productId/reviews
router.get("/products/:productId/reviews", validate(reviewQuerySchema), index);
router.post("/products/:productId/reviews", authenticate, validate(createReviewSchema), store);

// Standalone review routes → mounted at /reviews/:id
router.put("/reviews/:id", authenticate, validate(updateReviewSchema), update);
router.delete("/reviews/:id", authenticate, destroy);

export default router;
