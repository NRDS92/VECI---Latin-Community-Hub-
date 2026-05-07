import { api } from "../../../api/clients"

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

  const { data } = await api.get("/discover", {
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

  return data;
};

export const fetchSuggestions = async (q: string, type = "all") => {
  const { data } = await api.get("/discover/suggestions", {
    params: { q, type },
  });

  return data.data;
};

export const fetchCategories = async (type: string) => {
  const res = await api.get(`/discover/categories?type=${type}`);

  return res.data.data;
};