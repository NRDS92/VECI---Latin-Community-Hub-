import { Schema, model, Document } from "mongoose";

import {
    PUBLIC_CONTENT_TYPES,
    PublicContentType,
} from "../constants/public-content.types";

import {
    PUBLICATION_STATUS,
    PublicationStatus,
} from "./publication-status";

export interface PublicationDocument extends Document {
    /**
     * Type of entity being published.
     *
     * Example:
     * EVENT
     * BUSINESS
     * COMMUNITY
     */
    entityType: PublicContentType;
    /**
     * ID of the original domain entity.
     */
    entityId: string;
    /**
     * Public content lifecycle status.
     */
    status: PublicationStatus;
    /**
     * Globally unique public slug.
     *
     * Example:
     * salsa-night-cologne
     */
    slug: string;
    /**
     * Date when the content was first published.
     */
    publishedAt?: Date;
    /**
     * Date when the content was unpublished.
     */
    unpublishedAt?: Date;
    /**
     * SEO title.
     */
    seoTitle?: string;

    /**
     * SEO description.
     */
    seoDescription?: string;

    /**
     * Canonical public URL.
     */
    canonicalUrl?: string;
    createdAt: Date;
    updatedAt: Date;

}

const publicationSchema =
    new Schema<PublicationDocument>(
        {

            entityType: {
                type: String,
                enum: Object.values(
                    PUBLIC_CONTENT_TYPES
                ),
                required: true,
            },

            entityId: {
                type: String,
                required: true,
                trim: true,
            },

            status: {
                type: String,
                enum: Object.values(
                    PUBLICATION_STATUS
                ),
                default:
                    PUBLICATION_STATUS.PRIVATE,
                required: true,
            },

            slug: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true,
            },

            publishedAt: {
                type: Date,
            },

            unpublishedAt: {
                type: Date,
            },

            seoTitle: {
                type: String,
                trim: true,
            },

            seoDescription: {
                type: String,
                trim: true,
            },

            canonicalUrl: {
                type: String,
                trim: true,
            },

        },
        {
            timestamps: true,
        }
    );

/**
 * A domain entity can have only one publication.
 *
 * Prevents:
 *
 * EVENT + abc123
 * EVENT + abc123
 *
 * from existing more than once.
 */
publicationSchema.index(
    {
        entityType: 1,
        entityId: 1,
    },
    {
        unique: true,
    }
);

export const Publication =
    model<PublicationDocument>(
        "Publication",
        publicationSchema
    );