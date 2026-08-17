import {
    buildPublicUrl,
    createSitemapEntry,
} from "./sitemap.service";

import {
    PUBLIC_CONTENT_TYPES,
} from "../constants/public-content.types";

import {
    PUBLICATION_STATUS,
} from "../publication/publication-status";

import {
    describe,
    expect,
    it,
    jest,
} from "@jest/globals";

describe(
    "Sitemap Service",
    () => {

        it(
            "should build a public event URL",
            () => {

                const url =
                    buildPublicUrl({

                        entityType:
                            PUBLIC_CONTENT_TYPES.EVENT,

                        slug:
                            "salsa-night-cologne",

                    } as any);


                expect(url).toBe(
                    "https://veci-latin.com/events/salsa-night-cologne"
                );

            }
        );


        it(
            "should create a sitemap entry for published content",
            () => {

                const publication =
                    {

                        entityType:
                            PUBLIC_CONTENT_TYPES.EVENT,

                        entityId:
                            "event-123",

                        status:
                            PUBLICATION_STATUS.PUBLISHED,

                        slug:
                            "salsa-night-cologne",

                        updatedAt:
                            new Date(),

                    } as any;


                const entry =
                    createSitemapEntry(
                        publication
                    );


                expect(entry).not.toBeNull();

                expect(
                    entry?.url
                ).toBe(
                    "https://veci-latin.com/events/salsa-night-cologne"
                );

            }
        );


        it(
            "should exclude unpublished content",
            () => {

                const publication =
                    {

                        entityType:
                            PUBLIC_CONTENT_TYPES.EVENT,

                        entityId:
                            "event-123",

                        status:
                            PUBLICATION_STATUS.PRIVATE,

                        slug:
                            "private-event",

                        updatedAt:
                            new Date(),

                    } as any;


                const entry =
                    createSitemapEntry(
                        publication
                    );


                expect(entry).toBeNull();

            }
        );

    }
);