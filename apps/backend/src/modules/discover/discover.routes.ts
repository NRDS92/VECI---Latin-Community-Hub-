import { Router } from "express";
import * as discoverController from "./discover.controller";

const router = Router();

router.get("/", discoverController.getDiscoverFeed);
router.get("/categories", discoverController.getCategories);
router.get("/suggestions", discoverController.getSearchSuggestions);

export default router;