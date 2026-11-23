import {
    Router,
} from "express";

import {
    getPublicEvents,
    getPublicBusinesses,
    getCommunityEvents,
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

router.get(
    "/communities/:communityId/events",
    getCommunityEvents
);


export default router;
