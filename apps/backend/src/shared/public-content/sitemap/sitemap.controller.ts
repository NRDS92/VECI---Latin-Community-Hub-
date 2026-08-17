import {
    Request,
    Response,
} from "express";
import {
    catchAsync,
} from "../../../utils/catchAsync";
import {
    getSitemapXml,
} from "./sitemap.service";
import {
    PUBLIC_CONTENT_TYPES,
    PublicContentType,
} from "../constants/public-content.types";
import {
    AppError,
} from "../../errors/AppError";


export const getSitemap =
    catchAsync(
        async (
            _req: Request,
            res: Response
        ) => {

            const xml =
                await getSitemapXml();


            res
                .status(200)
                .type("application/xml")
                .send(xml);

        }
    );


export const getSitemapByType =
    catchAsync(
        async (
            req: Request,
            res: Response
        ) => {

            const entityType =
                req.params
                    .entityType as PublicContentType;


            if (
                !Object.values(
                    PUBLIC_CONTENT_TYPES
                ).includes(
                    entityType
                )
            ) {

                throw new AppError(
                    "Invalid sitemap content type.",
                    400,
                    "INVALID_SITEMAP_CONTENT_TYPE"
                );

            }


            const xml =
                await getSitemapXml({

                    entityType,

                });


            res
                .status(200)
                .type("application/xml")
                .send(xml);

        }
    );