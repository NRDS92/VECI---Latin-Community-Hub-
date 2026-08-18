import {
    Router,
} from "express";

import {
    getSitemap,
    getSitemapByType,
} from "./sitemap.controller";


const router =
    Router();


router.get(
    "/sitemap.xml",
    getSitemap
);


router.get(
    "/sitemap/:entityType.xml",
    getSitemapByType
);


export default router;