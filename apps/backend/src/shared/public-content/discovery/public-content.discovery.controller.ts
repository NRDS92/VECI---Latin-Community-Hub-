import {
    Request,
    Response,
} from "express";

import {
    catchAsync,
} from "../../../utils/catchAsync";

import {
    getRelatedEvents,
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