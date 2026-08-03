import { Router } from "express";
import * as adminController from "./admin.controller";
import * as businessController from "./business/business.admin.controller";

const router = Router();

router.get(
    "/events",
    adminController.getEvents
);

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


router.get(
    "/businesses",
    businessController.getBusinesses
);

router.get(
    "/businesses/pending",
    businessController.getPendingBusinesses
);

router.patch(
    "/businesses/:id/approve",
    businessController.approveBusiness
);

router.patch(
    "/businesses/:id/reject",
    businessController.rejectBusiness
);


export default router;