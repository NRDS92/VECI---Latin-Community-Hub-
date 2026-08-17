import {
    PublicationDocument,
} from "../publication/publication.model";
import {
    PUBLICATION_STATUS,
} from "../publication/publication-status";
import {
    PublicContentType,
    PUBLIC_CONTENT_TYPES,
} from "../constants/public-content.types";
import * as publicationRepository
    from "../publication/publication.repository";
import {
    generateSitemapXml,
} from "./sitemap.xml.service";

export interface SitemapEntry {

    /**
     * Absolute public URL.
     */
    url: string;

    /**
     * Last time the public content changed.
     */
    lastModified?: Date;

    /**
     * Optional sitemap priority.
     */
    priority?: number;

    /**
     * Optional change frequency.
     */
    changeFrequency?:
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never";
}


/**
 * Base URL of the public VECI website.
 */
const PUBLIC_SITE_URL =
    process.env.PUBLIC_SITE_URL ||
    "https://veci-latin.com";


/**
 * Map a publication type to its
 * public URL segment.
 */
const getPathSegment = (
    entityType: PublicContentType
): string => {

    switch (entityType) {

        case PUBLIC_CONTENT_TYPES.EVENT:
            return "events";

        case PUBLIC_CONTENT_TYPES.BUSINESS:
            return "businesses";

        case PUBLIC_CONTENT_TYPES.CITY:
            return "cities";

        case PUBLIC_CONTENT_TYPES.CATEGORY:
            return "categories";

        default:

            throw new Error(
                `Unsupported public content type: ${entityType}`
            );
    }
};


/**
 * Build the public URL for a publication.
 */
export const buildPublicUrl = (
    publication: Pick<
        PublicationDocument,
        "entityType" | "slug"
    >
): string => {

    const pathSegment =
        getPathSegment(
            publication.entityType
        );

    return `${PUBLIC_SITE_URL}/${pathSegment}/${publication.slug}`;
};


/**
 * Determine sitemap priority
 * based on the type of public content.
 */
const getPriority = (
    entityType: PublicContentType
): number => {

    switch (entityType) {

        case PUBLIC_CONTENT_TYPES.EVENT:
            return 0.8;

        case PUBLIC_CONTENT_TYPES.BUSINESS:
            return 0.8;

        case PUBLIC_CONTENT_TYPES.CITY:
            return 0.9;

        case PUBLIC_CONTENT_TYPES.CATEGORY:
            return 0.7;

        default:
            return 0.5;
    }
};


/**
 * Determine how frequently content
 * is expected to change.
 */
const getChangeFrequency = (
    entityType: PublicContentType
): SitemapEntry["changeFrequency"] => {

    switch (entityType) {

        case PUBLIC_CONTENT_TYPES.EVENT:
            return "daily";

        case PUBLIC_CONTENT_TYPES.BUSINESS:
            return "weekly";

        case PUBLIC_CONTENT_TYPES.CITY:
            return "weekly";

        case PUBLIC_CONTENT_TYPES.CATEGORY:
            return "weekly";

        default:
            return "monthly";
    }
};


/**
 * Convert a Publication into a sitemap entry.
 */
export const createSitemapEntry = (
    publication: PublicationDocument
): SitemapEntry | null => {

    /*
     * Only published content belongs
     * in the public sitemap.
     */
    if (
        publication.status !==
        PUBLICATION_STATUS.PUBLISHED
    ) {

        return null;
    }


    return {

        url:
            buildPublicUrl(
                publication
            ),

        lastModified:
            publication.updatedAt,

        priority:
            getPriority(
                publication.entityType
            ),

        changeFrequency:
            getChangeFrequency(
                publication.entityType
            ),
    };
};


/**
 * Convert multiple publications
 * into sitemap entries.
 */
export const createSitemapEntries = (
    publications: PublicationDocument[]
): SitemapEntry[] => {

    return publications
        .map(
            createSitemapEntry
        )
        .filter(
            (
                entry
            ): entry is SitemapEntry =>
                entry !== null
        );
};


/**
 * Get published content prepared
 * for sitemap generation.
 *
 * Pagination is intentionally exposed here.
 *
 * This allows the future sitemap layer
 * to generate segmented sitemaps without
 * loading every publication into memory.
 */
export const getPublishedSitemapEntries =
    async (
        options?: {
            entityType?: PublicContentType;
            page?: number;
            limit?: number;
        }
    ): Promise<SitemapEntry[]> => {

        const publications =
            await publicationRepository.findPublished(
                options
            );

        return createSitemapEntries(
            publications
        );
    };

    /**
 * Generate a sitemap XML document.
 *
 * The optional filters allow us to generate
 * segmented sitemaps by content type and page.
 */
export const getSitemapXml = async (
    options?: {
        entityType?: PublicContentType;
        page?: number;
        limit?: number;
    }
): Promise<string> => {

    const entries =
        await getPublishedSitemapEntries(
            options
        );

    return generateSitemapXml(
        entries
    );
};