
import type { z } from "zod";
import {
  PublicEventSchema,
  PublicEventWithCreatorSchema,
} from "./event.schema.js";

export type PublicEvent = z.infer<
  typeof PublicEventSchema
>;

export type PublicEventWithCreator = z.infer<
  typeof PublicEventWithCreatorSchema
>;
