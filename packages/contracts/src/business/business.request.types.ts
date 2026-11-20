import type { z } from "zod";
import {
  CreateBusinessRequestSchema,
  UpdateBusinessRequestSchema,
} from "./business.request.schema.js";

export type CreateBusinessRequest = z.input<typeof CreateBusinessRequestSchema>;
export type ParsedCreateBusinessRequest = z.output<typeof CreateBusinessRequestSchema>;
export type UpdateBusinessRequest = z.input<typeof UpdateBusinessRequestSchema>;
export type ParsedUpdateBusinessRequest = z.output<typeof UpdateBusinessRequestSchema>;
