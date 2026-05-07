import { useQuery } from "@tanstack/react-query";
import { Category } from "../types/discover.types";
import { fetchCategories } from "../services/discover.service";

export const useCategories = (type: string) => {
  return useQuery<Category[]>({
    queryKey: ["categories", type],
    queryFn: () => fetchCategories(type),
  });
};