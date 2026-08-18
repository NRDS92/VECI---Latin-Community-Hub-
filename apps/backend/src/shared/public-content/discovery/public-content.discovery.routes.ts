import {
    Router,
} from "express";

import {
    getPublicEvents,
} from "./public-content.discovery.controller";


const router =
    Router();


router.get(
    "/events",
    getPublicEvents
);


export default router;