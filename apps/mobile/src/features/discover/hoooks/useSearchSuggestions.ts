import { useQuery } from "@tanstack/react-query";
import { SearchSuggestion } from "../types/discover.types";
import { fetchSuggestions } from "../services/discover.service";

export const useSearchSuggestions = (
  search: string,
  type: string
) => {
  return useQuery<SearchSuggestion[]>({
    queryKey: ["suggestions", search, type],
    queryFn: () => fetchSuggestions(search, type),
    enabled: search.length > 2,
  });
};