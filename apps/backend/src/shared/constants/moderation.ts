export const MODERATION_STATUS = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
} as const;

export type ModerationStatus =
    (typeof MODERATION_STATUS)[keyof typeof MODERATION_STATUS];

export const MODERATION_REJECTION_REASON = {
    SPAM: "SPAM",
    DUPLICATE: "DUPLICATE",
    FALSE_INFORMATION: "FALSE_INFORMATION",
    OFFENSIVE_CONTENT: "OFFENSIVE_CONTENT",
    INVALID_LOCATION: "INVALID_LOCATION",
    INSUFFICIENT_INFORMATION: "INSUFFICIENT_INFORMATION",
    OTHER: "OTHER",
} as const;

export type ModerationRejectionReason =
    (typeof MODERATION_REJECTION_REASON)[keyof typeof MODERATION_REJECTION_REASON];

    export const MODERATION_REJECTION_REASONS =
    Object.values(
        MODERATION_REJECTION_REASON
    ) as [
        ModerationRejectionReason,
        ...ModerationRejectionReason[]
    ];