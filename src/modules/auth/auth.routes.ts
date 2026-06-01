import { Router } from "express";
import { register, verify, login, me } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { registerSchema, loginSchema, verifyOTPSchema } from "./auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/verify-otp", validate(verifyOTPSchema), verify);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, me);

export default router;