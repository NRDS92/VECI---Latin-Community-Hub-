import {
    Request,
    Response,
} from "express";

import {
    catchAsync,
} from "../../../utils/catchAsync";

import {
    resolveBySlug,
} from "./public-content.resolver";


export const getPublicContentBySlug =
    catchAsync(
        async (
            req: Request,
            res: Response
        ) => {

            const slugParam =
                req.params.slug;


            if (
                typeof slugParam !== "string"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid slug.",

                    code:
                        "INVALID_PUBLIC_CONTENT_SLUG",

                });

            }


            const result =
                await resolveBySlug(
                    slugParam
                );


            res.json({

                success: true,

                data: result,

            });

        }
    );