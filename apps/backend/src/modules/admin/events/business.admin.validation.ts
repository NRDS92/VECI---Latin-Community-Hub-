import { z } from "zod";
import {
    MODERATION_REJECTION_REASON,
} from "../../../shared/constants/moderation";

export const rejectEventSchema = z.object({
    body: z.object({
        reason: z.enum(
            Object.values(
                MODERATION_REJECTION_REASON
            ) as [
                string,
                ...string[]
            ]
        ),

        comment: z
            .string()
            .max(500)
            .optional(),
    }),
});