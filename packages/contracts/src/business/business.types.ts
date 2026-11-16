import type { z } from "zod";
import { PublicBusinessSchema } from "./business.schema.js";

export type PublicBusiness = z.infer<
  typeof PublicBusinessSchema
>;