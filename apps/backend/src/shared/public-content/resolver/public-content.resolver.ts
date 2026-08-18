import {
    Publication,
} from "../publication/publication.model";
import {
    PUBLICATION_STATUS,
} from "../publication/publication-status";
import {
    PUBLIC_CONTENT_TYPES,
} from "../constants/public-content.types";
import {
    Event,
} from "../../../modules/events/event.model";
import {
    AppError,
} from "../../errors/AppError";
import {
    PublicationDocument,
} from "../publication/publication.model";


export interface ResolvedPublicContent {
    publication: PublicationDocument;
    entity: unknown;
}

/**
 * Resolve public content by its public slug.
 *
 * The Publication is the entry point.
 *
 * slug
 *   ↓
 * Publication
 *   ↓
 * entityType + entityId
 *   ↓
 * Domain entity
 */
export const resolveBySlug = async (
    slug: string
): Promise<ResolvedPublicContent> => {
    if (!slug) {
        throw new AppError(
            "Public content slug is required.",
            400,
            "PUBLIC_CONTENT_SLUG_REQUIRED"
        );
    }
    const publication =
        await Publication.findOne({
            slug,
            status:
                PUBLICATION_STATUS.PUBLISHED,
        });
    if (!publication) {
        throw new AppError(
            "Public content not found.",
            404,
            "PUBLIC_CONTENT_NOT_FOUND"
        );
    }
    let entity: unknown;
    switch (
        publication.entityType
    ) {
        case PUBLIC_CONTENT_TYPES.EVENT:
            entity =
                await Event.findById(
                    publication.entityId
                )
                    .populate(
                        "createdBy",
                        "name profileImage"
                    )
                    .populate(
                        "businessId",
                        "name images"
                    );
            break;
        default:
            throw new AppError(
                `Public content type "${publication.entityType}" is not supported yet.`,
                501,
                "PUBLIC_CONTENT_TYPE_NOT_IMPLEMENTED"
            );
    }


    if (!entity) {
        throw new AppError(
            "Published content entity not found.",
            404,
            "PUBLIC_CONTENT_ENTITY_NOT_FOUND"
        );
    }
    return {
        publication,
        entity,
    };
};