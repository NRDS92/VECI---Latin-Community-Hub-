import { Router } from "express";
import * as adminController from "./admin.controller";

const router = Router();

router.get(
    "/events/pending",
    adminController.getPendingEvents
);

router.patch(
    "/events/:id/approve",
    adminController.approveEvent
);

router.patch(
    "/events/:id/reject",
    adminController.rejectEvent
);

export default router;