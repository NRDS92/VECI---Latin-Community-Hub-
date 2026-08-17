import {
    PublicContentType,
} from "../constants/public-content.types";

export interface ContentPublishedEvent {

    /**
     * Event name.
     */
    type: "CONTENT_PUBLISHED";

    /**
     * Publication identifier.
     */
    publicationId: string;

    /**
     * Original domain entity type.
     */
    entityType: PublicContentType;

    /**
     * Original domain entity identifier.
     */
    entityId: string;

    /**
     * Current public slug.
     */
    slug: string;

    /**
     * Time when the content became public.
     */
    publishedAt: Date;
}