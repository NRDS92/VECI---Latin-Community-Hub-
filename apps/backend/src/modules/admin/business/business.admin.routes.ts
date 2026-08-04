import { Router } from "express";

import * as businessController from "./business.admin.controller";

const router = Router();

router.get(
    "/",
    businessController.getBusinesses
);

router.get(
    "/pending",
    businessController.getPendingBusinesses
);

router.patch(
    "/:id/approve",
    businessController.approveBusiness
);

router.patch(
    "/:id/reject",
    businessController.rejectBusiness
);

export default router;