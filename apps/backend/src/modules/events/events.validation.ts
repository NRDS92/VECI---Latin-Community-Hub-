import {
  CreateEventRequestSchema,
  UpdateEventRequestSchema,
  type ParsedCreateEventRequest,
  type ParsedUpdateEventRequest,
} from "@ndrs92/contracts";

export const createEventSchema = CreateEventRequestSchema;
export const updateEventSchema = UpdateEventRequestSchema;
export type CreateEventInput = ParsedCreateEventRequest;
export type UpdateEventInput = ParsedUpdateEventRequest;
