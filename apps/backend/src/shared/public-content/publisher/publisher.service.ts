import {
    PublicContentType,
} from "../constants/public-content.types";

import {
    createPublication,
    publish,
} from "../publication/publication.service";

import {
    PublicationDocument,
} from "../publication/publication.model";


export interface PublishContentInput {

    entityType: PublicContentType;

    entityId: string;

    title: string;

    slug?: string;

    slugContext?: string;

    seoTitle?: string;

    seoDescription?: string;

    canonicalUrl?: string;
}


/**
 * Create and immediately publish public content.
 *
 * The publisher coordinates the publication lifecycle.
 *
 * Entity-specific logic remains outside this service.
 */
export const publishContent = async (
    data: PublishContentInput
): Promise<PublicationDocument> => {

    /*
     * Create publication.
     */
    const publication =
        await createPublication(
            data
        );

    /*
     * Publish publication.
     */
    const publishedPublication =
        await publish(
            publication._id.toString()
        );

    return publishedPublication;
};