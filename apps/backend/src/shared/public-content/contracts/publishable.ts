import { PublicContentType } from "../constants/public-content.types";

export interface Publishable {

    /**
     * Internal identifier.
     */
    id: string;

    /**
     * Public content type.
     */
    type: PublicContentType;

    /**
     * Human readable title.
     */
    title: string;

    /**
     * Permanent public URL.
     */
    slug: string;

    /**
     * Whether the content is visible publicly.
     */
    isPublic: boolean;

    /**
     * Publication timestamp.
     */
    publishedAt?: Date;

}