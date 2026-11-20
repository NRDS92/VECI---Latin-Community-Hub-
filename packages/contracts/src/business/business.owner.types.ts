import type { z } from "zod";
import {
  OwnerBusinessSchema,
  OwnerBusinessResponseSchema,
  OwnerBusinessesResponseSchema,
} from "./business.owner.schema.js";

export type OwnerBusiness = z.infer<typeof OwnerBusinessSchema>;
export type OwnerBusinessResponse = z.infer<typeof OwnerBusinessResponseSchema>;
export type OwnerBusinessesResponse = z.infer<typeof OwnerBusinessesResponseSchema>;
