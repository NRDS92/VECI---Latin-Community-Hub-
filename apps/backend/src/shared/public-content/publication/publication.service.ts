import {
    PUBLICATION_STATUS,
} from "./publication-status";
import {
    PublicContentType,
} from "../constants/public-content.types";
import { SlugService } from "../slugs/slug.service";
import { AppError } from "../../errors/AppError";
import * as publicationRepository
    from "./publication.repository";
import {
    publishEvent,
} from "../events/public-content.event-bus";

interface CreatePublicationInput {
    entityType: PublicContentType;
    entityId: string;
    title: string;
    /**
     * Optional explicit slug.
     * If omitted, the slug is generated from the title.
     */
    slug?: string;
    /**
     * Optional semantic context used
     * when the base slug collides.
     */
    slugContext?: string;
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
}


/**
 * Maximum number of slug candidates
 * that will be attempted.
 */
const MAX_SLUG_ATTEMPTS = 3;


/**
 * Detect whether a MongoDB duplicate key
 * error was caused by the slug unique index.
 */
const isDuplicateSlugError = (
    error: unknown
): boolean => {
    if (
        !error ||
        typeof error !== "object"
    ) {
        return false;
    }

    const mongoError =
        error as {
            code?: number;
            keyPattern?: Record<string, unknown>;
        };

    return (
        mongoError.code === 11000 &&
        !!mongoError.keyPattern?.slug
    );
};


/**
 * Detect whether a MongoDB duplicate key
 * error was caused by the entity unique index.
 */
const isDuplicateEntityError = (
    error: unknown
): boolean => {
    if (
        !error ||
        typeof error !== "object"
    ) {
        return false;
    }

    const mongoError =
        error as {
            code?: number;
            keyPattern?: Record<string, unknown>;
        };

    return (
        mongoError.code === 11000 &&
        !!mongoError.keyPattern?.entityType &&
        !!mongoError.keyPattern?.entityId
    );
};


/**
 * Create a new publication.
 */
export const createPublication = async (
    data: CreatePublicationInput
) => {
    const {
        entityType,
        entityId,
        title,
        slug,
        slugContext,
        seoTitle,
        seoDescription,
        canonicalUrl,
    } = data;

    /*
     * Basic validation
     */
    if (!entityId) {
        throw new AppError(
            "Entity ID is required.",
            400,
            "ENTITY_ID_REQUIRED"
        );
    }

    if (!title) {
        throw new AppError(
            "Publication title is required.",
            400,
            "PUBLICATION_TITLE_REQUIRED"
        );
    }

    /*
     * Check whether the entity already
     * has a publication.
     *
     * The repository performs the actual
     * persistence query.
     */
    const existingPublication =
        await publicationRepository.findByEntity(
            entityType,
            entityId
        );

    if (existingPublication) {
        throw new AppError(
            "Publication already exists.",
            409,
            "PUBLICATION_ALREADY_EXISTS"
        );
    }


    /*
     * Generate the initial slug.
     */
    const baseSlug =
        SlugService.generate(
            slug || title
        );


    if (!baseSlug) {
        throw new AppError(
            "Unable to generate a valid publication slug.",
            400,
            "INVALID_PUBLICATION_SLUG"
        );
    }


    /*
     * Prepare slug candidates.
     */

    const slugCandidates: string[] = [
        baseSlug,
    ];


    /*
     * Contextual fallback.
     */

    if (slugContext) {
        const contextualSlug =
            SlugService.generateWithContext(
                slug || title,
                slugContext
            );

        if (
            contextualSlug &&
            contextualSlug !== baseSlug
        ) {
            slugCandidates.push(
                contextualSlug
            );
        }
    }


    /*
     * Deterministic identifier fallback.
     */

    const identifierSlug =
        SlugService.generateWithIdentifier(
            title,
            entityId
        );

    if (
        identifierSlug &&
        !slugCandidates.includes(
            identifierSlug
        )
    ) {
        slugCandidates.push(
            identifierSlug
        );
    }


    /*
     * Try each slug candidate.
     */
    for (
        let attempt = 0;
        attempt <
        Math.min(
            slugCandidates.length,
            MAX_SLUG_ATTEMPTS
        );
        attempt++
    ) {
        const candidateSlug =
            slugCandidates[attempt];
        try {
            const publication =
                await publicationRepository.create({
                    entityType,
                    entityId,
                    status:
                        PUBLICATION_STATUS.PRIVATE,
                    slug:
                        candidateSlug,
                    seoTitle,
                    seoDescription,
                    canonicalUrl,
                });

            return publication;
        } catch (error: unknown) {
            /*
             * Another request may have created
             * the same entity publication after
             * our initial lookup.
             */
            if (
                isDuplicateEntityError(
                    error
                )
            ) {
                throw new AppError(
                    "Publication already exists.",
                    409,
                    "PUBLICATION_ALREADY_EXISTS"
                );
            }


            /*
             * Slug collision.
             *
             * Try the next candidate.
             */
            if (
                isDuplicateSlugError(
                    error
                )
            ) {
                continue;
            }
            throw error;
        }
    }

    throw new AppError(
        "Unable to generate a unique publication slug.",
        409,
        "PUBLICATION_SLUG_CONFLICT"
    );
};


/**
 * Publish a publication.
 */
export const publish = async (
    publicationId: string
) => {
    const publication =
        await publicationRepository.findById(
            publicationId
        );

    if (!publication) {
        throw new AppError(
            "Publication not found.",
            404,
            "PUBLICATION_NOT_FOUND"
        );
    }

    if (
        publication.status ===
        PUBLICATION_STATUS.PUBLISHED
    ) {
        return publication;
    }

    if (
        publication.status ===
        PUBLICATION_STATUS.ARCHIVED
    ) {
        throw new AppError(
            "Archived publications cannot be published.",
            409,
            "PUBLICATION_ARCHIVED"
        );
    }

    publication.status =
        PUBLICATION_STATUS.PUBLISHED;

    /*
     * Preserve the first publication date.
     */
    publication.publishedAt =
        publication.publishedAt ||
        new Date();

    /*
     * Publication is visible again.
     */
    publication.unpublishedAt =
        undefined;

    await publicationRepository.save(
        publication
    );
    await publicationRepository.save(
        publication
    );
    await publishEvent({
        type: "CONTENT_PUBLISHED",
        publicationId:
            publication._id.toString(),
        entityType:
            publication.entityType,
        entityId:
            publication.entityId,
        slug:
            publication.slug,
        publishedAt:
            publication.publishedAt!,
    });

    return publication;
};


/**
 * Unpublish a publication.
 */
export const unpublish = async (
    publicationId: string
) => {

    const publication =
        await publicationRepository.findById(
            publicationId
        );


    if (!publication) {

        throw new AppError(
            "Publication not found.",
            404,
            "PUBLICATION_NOT_FOUND"
        );

    }


    if (
        publication.status ===
        PUBLICATION_STATUS.ARCHIVED
    ) {

        throw new AppError(
            "Archived publications cannot be unpublished.",
            409,
            "PUBLICATION_ARCHIVED"
        );

    }


    publication.status =
        PUBLICATION_STATUS.UNPUBLISHED;


    publication.unpublishedAt =
        new Date();


    await publicationRepository.save(
        publication
    );

    return publication;
};


/**
 * Archive a publication permanently.
 */
export const archive = async (
    publicationId: string
) => {

    const publication =
        await publicationRepository.findById(
            publicationId
        );


    if (!publication) {

        throw new AppError(
            "Publication not found.",
            404,
            "PUBLICATION_NOT_FOUND"
        );

    }


    publication.status =
        PUBLICATION_STATUS.ARCHIVED;


    publication.unpublishedAt =
        publication.unpublishedAt ||
        new Date();


    await publicationRepository.save(
        publication
    );

    return publication;
};