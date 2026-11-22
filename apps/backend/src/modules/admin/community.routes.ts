import { Router } from "express";
import * as controller from "../community/community.admin.controller";

const router = Router();
router.get("/", controller.list);
router.get("/pending", controller.pending);
router.post("/:communityId/approve", controller.approve);
router.post("/:communityId/reject", controller.reject);
router.post("/:communityId/suspend", controller.suspend);
router.post("/:communityId/block", controller.block);
router.post("/:communityId/restore", controller.restore);
router.get("/reports", controller.reports);
router.patch("/reports/:reportId", controller.resolveReport);
router.post("/:communityId/moderate-content", controller.moderateContent);
export default router;
