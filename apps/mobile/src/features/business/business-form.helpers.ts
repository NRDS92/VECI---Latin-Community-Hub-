import {
  CreateBusinessRequestSchema,
  UpdateBusinessRequestSchema,
  type CreateBusinessRequest,
  type OwnerBusiness,
  type UpdateBusinessRequest,
} from "@ndrs92/contracts";
import type { BusinessFormValues } from "./business-form.types";

export function buildCreateBusinessRequest(values: BusinessFormValues): CreateBusinessRequest {
  return CreateBusinessRequestSchema.parse({
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    category: values.category,
    subCategory: values.subCategory || undefined,
    priceRange: values.priceRange,
    profile: { languages: ["es"], services: [], specialties: [], serviceArea: [] },
    images: { profile: values.image, gallery: [] },
    documents: values.menu ? [{ type: "menu", url: values.menu }] : [],
    location: {
      address: values.address,
      cityId: values.cityId,
      country: "Germany",
      latitude: values.coordinates.latitude,
      longitude: values.coordinates.longitude,
    },
    contact: { phone: values.phone, instagram: values.instagram },
    community: { isLatinoOwned: true },
    tags: [],
  });
}

export function buildUpdateBusinessRequest(
  values: BusinessFormValues,
  business: OwnerBusiness,
): UpdateBusinessRequest {
  const existingDocuments = business.documents.map((document) => ({ ...document }));
  const existingMenu = existingDocuments.find((document) => document.type === "menu")?.url
    ?? business.menu;
  const documents = values.menu && values.menu !== existingMenu
    ? [
        ...existingDocuments.filter((document) => document.type !== "menu"),
        { type: "menu" as const, url: values.menu },
      ]
    : existingDocuments;

  return UpdateBusinessRequestSchema.parse({
    name: values.name.trim(),
    description: values.description,
    category: values.category,
    subCategory: values.subCategory || undefined,
    priceRange: values.priceRange,
    profile: { ...business.profile },
    images: { ...business.images, profile: values.image },
    documents,
    location: {
      address: values.address,
      cityId: values.cityId,
      country: business.location.country,
      latitude: values.coordinates.latitude,
      longitude: values.coordinates.longitude,
    },
    contact: { ...business.contact, phone: values.phone, instagram: values.instagram },
    community: { ...business.community },
    tags: [...business.tags],
  });
}
