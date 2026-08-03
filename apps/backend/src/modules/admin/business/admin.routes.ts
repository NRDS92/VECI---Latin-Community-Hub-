import { Router } from "express";


import * as businessController from "./business.admin.controller";

import {
    rejectBusinessSchema,
} from "./business.admin.validation";

const router = Router();

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