import {
    Request,
    Response,
} from "express";

import {
    catchAsync,
} from "../../../utils/catchAsync";

import {
    getRelatedEvents,
    getRelatedBusinesses,
    getPublicCommunityEvents,
} from "./public-content.discovery.service";


export const getPublicEvents =
    catchAsync(
        async (
            req: Request,
            res: Response
        ) => {

            const cityId =
                typeof req.query.cityId === "string"
                    ? req.query.cityId
                    : undefined;


            const category =
                typeof req.query.category === "string"
                    ? req.query.category
                    : undefined;


            const excludeEntityId =
                typeof req.query.excludeEntityId === "string"
                    ? req.query.excludeEntityId
                    : undefined;


            const parsedLimit =
                typeof req.query.limit === "string"
                    ? Number(req.query.limit)
                    : undefined;


            const limit =
                Number.isFinite(
                    parsedLimit
                )
                    ? parsedLimit
                    : undefined;


            const events =
                await getRelatedEvents({

                    cityId,

                    category,

                    excludeEntityId,

                    limit,

                });


            res.json({

                success: true,

                data: events,

            });

        }
    );

export const getCommunityEvents = catchAsync(async (req: Request, res: Response) => {
    const communityId = req.params.communityId;
    if (typeof communityId !== "string") return res.status(400).json({ success: false, message: "Invalid Community ID", code: "INVALID_ID" });
    const parsedLimit = Number(req.query.limit);
    const limit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 50) : 20;
    const events = await getPublicCommunityEvents(communityId, limit);
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json({ success: true, data: events });
});


export const getPublicBusinesses =
    catchAsync(
        async (
            req: Request,
            res: Response
        ) => {

            const cityId =
                typeof req.query.cityId === "string"
                    ? req.query.cityId
                    : undefined;


            const category =
                typeof req.query.category === "string"
                    ? req.query.category
                    : undefined;


            const excludeEntityId =
                typeof req.query.excludeEntityId === "string"
                    ? req.query.excludeEntityId
                    : undefined;


            const parsedLimit =
                typeof req.query.limit === "string"
                    ? Number(req.query.limit)
                    : undefined;


            const limit =
                Number.isFinite(
                    parsedLimit
                )
                    ? parsedLimit
                    : undefined;


            const businesses =
                await getRelatedBusinesses({

                    cityId,

                    category,

                    excludeEntityId,

                    limit,

                });


            res.json({

                success: true,

                data: businesses,

            });

        }
    );
