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

    console.log(
        "📢 Publishing content:",
        {
            entityType:
                data.entityType,

            entityId:
                data.entityId,

            title:
                data.title,
        }
    );


    /*
     * Create publication.
     */
    const publication =
        await createPublication(
            data
        );


    console.log(
        "📝 Publication created:",
        {
            id:
                publication._id.toString(),

            entityType:
                publication.entityType,

            entityId:
                publication.entityId,

            slug:
                publication.slug,

            status:
                publication.status,
        }
    );


    /*
     * Publish publication.
     */
    const publishedPublication =
        await publish(
            publication._id.toString()
        );


    console.log(
        "🚀 Publication published:",
        {
            id:
                publishedPublication._id.toString(),

            entityType:
                publishedPublication.entityType,

            entityId:
                publishedPublication.entityId,

            slug:
                publishedPublication.slug,

            status:
                publishedPublication.status,

            publishedAt:
                publishedPublication.publishedAt,
        }
    );


    return publishedPublication;
};