import {
    Publication,
} from "../../public-content/publication/publication.model";

import {
    PUBLICATION_STATUS,
} from "../../public-content/publication/publication-status";

import {
    PublicContentType,
} from "../../public-content/constants/public-content.types";


/**
 * Returns the IDs of entities that currently
 * have a published public representation.
 *
 * This is one of the conditions required
 * for an entity to be discoverable.
 */
export const getPublishedEntityIds =
    async (
        entityType: PublicContentType
    ): Promise<string[]> => {

        const publications =
            await Publication.find({

                entityType,

                status:
                    PUBLICATION_STATUS.PUBLISHED,

            })
                .select(
                    "entityId"
                )
                .lean();


        return publications.map(
            publication =>
                publication.entityId
        );

    };