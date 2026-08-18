import {
    Router,
} from "express";

import {
    getPublicContentBySlug,
} from "./public-content.controller";


const router =
    Router();


router.get(
    "/:slug",
    getPublicContentBySlug
);


export default router;