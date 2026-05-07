import { Router } from "express";
import * as controller from "./business.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();


router.get("/me", authMiddleware, controller.getMyBusinesses);
router.get("/:id", controller.getBusinessById);

router.post("/", authMiddleware, controller.createBusiness);
router.put("/:id", authMiddleware, controller.updateBusiness);
router.delete("/:id", authMiddleware, controller.deleteBusiness);

export default router;