import { PublicBusinessSchema } from "@ndrs92/contracts";
import { api } from "../../../api/clients";
import { API_V1_URL } from "../../../config/env";
import type { DiscoverApiResponse, FeedItem } from "../types/discover.types";

interface DiscoverParams {
  page?: number;
  city?: string;
  category?: string;
  type?: "all" | "events" | "business";
  search?: string;
  date?: string | null;
}

export const fetchDiscover = async ({
  page = 1,
  city,
  category,
  type = "all",
  search,
  date
}: DiscoverParams) => {

  // 🔥 FIX CLAVE
  const isBusinessTab = type === "business" && category !== "food";

  const { data } = await api.get<DiscoverApiResponse>("/discover", {
    baseURL: API_V1_URL,
    params: {
      page,
      city,

      // 👇 restaurants
      ...(category === "food" && { category: "food" }),

      // 👇 businesses (excluir food)
      ...(isBusinessTab && { excludeCategory: "food" }),

      type,
      search,
      date: date || undefined,
    },
  });

  return {
    ...data,
    data: {
      ...data.data,
      recommended: data.data.recommended.flatMap<FeedItem>((item) => {
        if (item.type !== "business") return [item];

        const { type, ...business } = item;
        if (typeof business.slug !== "string") return [];
        return [{ ...PublicBusinessSchema.parse(business), type }];
      }),
    },
  };
};

export const fetchSuggestions = async (q: string, type = "all") => {
  const { data } = await api.get("/discover/suggestions", {
    baseURL: API_V1_URL,
    params: { q, type },
  });

  return data.data;
};

export const fetchCategories = async (type: string) => {
  const res = await api.get(`/discover/categories?type=${type}`, { baseURL: API_V1_URL });

  return res.data.data;
};
