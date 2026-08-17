import {
    Schema,
    model,
    Document,
} from "mongoose";

import {
    PublicContentType,
} from "../constants/public-content.types";

export interface PublicationRedirectDocument
    extends Document {

    /**
     * Previous public slug.
     */
    sourceSlug: string;

    /**
     * Current public slug.
     */
    targetSlug: string;

    /**
     * Type of the published entity.
     */
    entityType: PublicContentType;

    /**
     * ID of the published entity.
     */
    entityId: string;

}

const publicationRedirectSchema =
    new Schema<PublicationRedirectDocument>(
        {

            sourceSlug: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true,
            },

            targetSlug: {
                type: String,
                required: true,
                lowercase: true,
                trim: true,
            },

            entityType: {
                type: String,
                required: true,
                trim: true,
            },

            entityId: {
                type: String,
                required: true,
                trim: true,
            },

        },
        {
            timestamps: true,
        }
    );

/**
 * Fast lookup when resolving an old URL.
 */
publicationRedirectSchema.index({
    sourceSlug: 1,
});

export const PublicationRedirect =
    model<PublicationRedirectDocument>(
        "PublicationRedirect",
        publicationRedirectSchema
    );