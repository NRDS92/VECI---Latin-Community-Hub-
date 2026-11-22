import type { z } from "zod";
import { BusinessPriceRangeSchema, PublicBusinessSchema } from "./business.schema.js";

export type PublicBusiness = z.infer<
  typeof PublicBusinessSchema
>;
export type BusinessPriceRange = z.infer<typeof BusinessPriceRangeSchema>;
