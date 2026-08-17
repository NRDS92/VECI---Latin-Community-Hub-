import {
    describe,
    expect,
    it,
    jest,
} from "@jest/globals";
import {
    ContentPublishedEvent,
} from "./content-published.event";
import {
    subscribe,
    publishEvent,
} from "./public-content.event-bus";
import {
    PUBLIC_CONTENT_TYPES,
} from "../constants/public-content.types";


describe(
    "Public Content Event Bus",
    () => {

        it(
            "should publish CONTENT_PUBLISHED events to subscribers",
            async () => {

                const handler =
                    jest.fn(
                        (
                            _event: ContentPublishedEvent
                        ): void => {}
                    );

                subscribe(handler);

                const publishedAt =
                    new Date();

                await publishEvent({

                    type:
                        "CONTENT_PUBLISHED",

                    publicationId:
                        "test-publication-id",

                    entityType:
                        PUBLIC_CONTENT_TYPES.EVENT,

                    entityId:
                        "test-event-id",

                    slug:
                        "salsa-night-cologne",

                    publishedAt,

                });

                expect(
                    handler
                ).toHaveBeenCalledTimes(1);

                expect(
                    handler
                ).toHaveBeenCalledWith({

                    type:
                        "CONTENT_PUBLISHED",

                    publicationId:
                        "test-publication-id",

                    entityType:
                        PUBLIC_CONTENT_TYPES.EVENT,

                    entityId:
                        "test-event-id",

                    slug:
                        "salsa-night-cologne",

                    publishedAt,

                });

            }
        );

    }
);