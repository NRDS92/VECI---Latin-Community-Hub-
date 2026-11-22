import axios from "axios";
import { PublicBusinessSchema, type PublicBusiness } from "@ndrs92/contracts";
import { API_V1_URL } from "../../../config/env";

const publicApi = axios.create({ baseURL: API_V1_URL, timeout: 15000 });

export async function getPublicBusinessBySlug(slug: string): Promise<PublicBusiness> {
  const { data } = await publicApi.get<{
    success?: unknown;
    data?: { publication?: { entityType?: unknown }; entity?: unknown };
  }>(`/public/content/${encodeURIComponent(slug)}`);

  if (data?.success !== true || data.data?.publication?.entityType !== "BUSINESS") {
    throw new Error("Expected a public business publication");
  }

  return PublicBusinessSchema.parse(data.data.entity);
}
