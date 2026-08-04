import { Router } from "express";
import * as adminController from "./events.admin.controller";

const router = Router();

router.get(
    "/",
    adminController.getEvents
);

router.get(
    "/pending",
    adminController.getPendingEvents
);

router.patch(
    "/:id/approve",
    adminController.approveEvent
);

router.patch(
    "/:id/reject",
    adminController.rejectEvent
);

export default router;