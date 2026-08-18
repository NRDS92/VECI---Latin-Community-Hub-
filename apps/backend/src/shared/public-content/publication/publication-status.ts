/**
 * Public visibility lifecycle.
 *
 * Independent from moderation.
 */

export const PUBLICATION_STATUS = {

    PRIVATE: "PRIVATE",

    PUBLISHED: "PUBLISHED",

    UNPUBLISHED: "UNPUBLISHED",

    ARCHIVED: "ARCHIVED",

} as const;

export type PublicationStatus =
    typeof PUBLICATION_STATUS[keyof typeof PUBLICATION_STATUS];