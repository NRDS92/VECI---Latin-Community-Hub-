import { Publication } from "./publication.model";
import type {
    PublicationDocument,
} from "./publication.model";

import {
    PublicContentType,
} from "../constants/public-content.types";

import {
    PUBLICATION_STATUS,
    PublicationStatus,
} from "./publication-status";

export interface CreatePublicationRepositoryInput {

    entityType: PublicContentType;

    entityId: string;

    status: PublicationStatus;

    slug: string;

    seoTitle?: string;

    seoDescription?: string;

    canonicalUrl?: string;
}


/**
 * Find a publication by its domain entity.
 */
export const findByEntity = async (
    entityType: PublicContentType,
    entityId: string
): Promise<PublicationDocument | null> => {

    return Publication.findOne({
        entityType,
        entityId,
    });
};


/**
 * Create a publication.
 *
 * MongoDB unique indexes remain the final
 * authority for entity and slug uniqueness.
 */
export const create = async (
    data: CreatePublicationRepositoryInput
): Promise<PublicationDocument> => {

    return Publication.create(data);
};


/**
 * Find a publication by its ID.
 */
export const findById = async (
    publicationId: string
): Promise<PublicationDocument | null> => {

    return Publication.findById(
        publicationId
    );
};


/**
 * Save an existing publication.
 */
export const save = async (
    publication: PublicationDocument
): Promise<PublicationDocument> => {

    return publication.save();
};

/**
 * Find published publications.
 *
 * Results are paginated to avoid loading
 * the entire publication collection into memory.
 */
export const findPublished = async (
    options?: {
        entityType?: PublicContentType;
        page?: number;
        limit?: number;
    }
): Promise<PublicationDocument[]> => {

    const {
        entityType,
        page = 1,
        limit = 1000,
    } = options || {};


    const filters: Record<
        string,
        unknown
    > = {

        status:
            PUBLICATION_STATUS.PUBLISHED,

    };


    if (entityType) {

        filters.entityType =
            entityType;

    }


    const safePage =
        Math.max(page, 1);

    const safeLimit =
        Math.min(
            Math.max(limit, 1),
            1000
        );


    const skip =
        (safePage - 1) *
        safeLimit;


    return Publication
        .find(filters)
        .sort({
            updatedAt: -1,
        })
        .skip(skip)
        .limit(safeLimit);
};