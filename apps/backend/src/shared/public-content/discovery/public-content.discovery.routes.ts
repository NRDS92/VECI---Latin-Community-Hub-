import {
    Router,
} from "express";

import {
    getPublicEvents,
    getPublicBusinesses,
} from "./public-content.discovery.controller";


const router =
    Router();


router.get(
    "/events",
    getPublicEvents
);


router.get(
    "/businesses",
    getPublicBusinesses
);


export default router;