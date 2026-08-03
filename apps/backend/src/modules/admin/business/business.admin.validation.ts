import { z } from "zod";

import {
    MODERATION_REJECTION_REASONS,
} from "../../../shared/constants/moderation";

export const rejectBusinessSchema = z.object({
    reason: z.enum(MODERATION_REJECTION_REASONS),
    comment: z.string().optional(),
});

export type RejectBusinessInput =
    z.infer<typeof rejectBusinessSchema>;