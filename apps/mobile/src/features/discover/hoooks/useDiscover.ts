import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchDiscover } from "../services/discover.service";
import { DiscoverApiResponse, FeedItem } from "../types/discover.types";
import { injectAds } from "../utils/injectAds";

interface UseDiscoverParams {
  city?: string;
  category?: string;
  type?: "all" | "events" | "business";
  search?: string;
  date?: string | null;
}

export const useDiscover = ({
  city,
  category,
  type = "all",
  search,
  date,
}: UseDiscoverParams = {}) => {
  // ✅ NORMALIZE PARAMS (evita keys inestables)
  const normalizedSearch = search?.trim() || "";
  const normalizedDate = date || "";

  const query = useInfiniteQuery<DiscoverApiResponse>({
    queryKey: [
      "discover",
      city || "",
      category || "",
      type,
      normalizedSearch,
      normalizedDate,
    ],

    queryFn: ({ pageParam = 1 }) =>
      fetchDiscover({
        page: pageParam as number,
        city,
        category,
        type,
        search: normalizedSearch,
        date: normalizedDate || undefined,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) =>
      lastPage?.data?.hasMore
        ? lastPage.data.page + 1
        : undefined,

    staleTime: 1000 * 60 * 5,

    // 🔥 PRO: evita refetch innecesario al volver a pantalla
    refetchOnMount: false,
    refetchOnWindowFocus: false,

    retry: 1,
  });

  // 🔥 MEMO: evita recalcular en cada render
  const items = useMemo(() => {
    const rawItems: FeedItem[] =
      query.data?.pages?.flatMap((p) => p?.data?.recommended ?? []) || [];

    const uniqueItems: FeedItem[] = Array.from(
      new Map(rawItems.map((e) => [e._id, e])).values()
    );

    if (type === "events") {
      return injectAds(uniqueItems as any);
    }

    return uniqueItems;
  }, [query.data, type]);

  return {
    items,

    loading: query.isLoading,

    // 🔥 mejor naming
    refreshing: query.isRefetching,

    error: query.error as Error | null,

    refetch: query.refetch,

    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    loadingMore: query.isFetchingNextPage,
  };
};