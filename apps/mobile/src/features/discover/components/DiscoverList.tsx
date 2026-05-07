import React, { useCallback } from "react";
import {
  FlatList,
  ActivityIndicator,
  ListRenderItem,
} from "react-native";

import EventCard from "../../events/components/EventCard";
import BusinessCard from "../../business/components/BusinnessCard";
import AdCard from "./AdCard";

import { FeedItem, AdItem } from "../types/discover.types";

type Props = {
  items: FeedItem[];
  handleToggle: (id: string) => void;
  isFavorite: (id: string) => boolean;
  favorites: string[];
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  refetch: () => void;
};

function DiscoverList({
  items,
  handleToggle,
  isFavorite,
  favorites,
  fetchNextPage,
  hasNextPage,
  loadingMore,
  refreshing,
  refetch,
}: Props) {
  // ✅ RENDER ITEM (TIPADO CORRECTO)
  const renderItem: ListRenderItem<FeedItem> = useCallback(
    ({ item }) => {
      if (item.type === "ad") {
        return <AdCard item={item as AdItem} />;
      }

      if (item.type === "business") {
        return <BusinessCard item={item} />;
      }

      return (
        <EventCard
          item={item}
          onToggle={handleToggle}
          isFavorite={isFavorite(item._id)}
        />
      );
    },
    [handleToggle, isFavorite]
  );

  // ✅ KEY EXTRACTOR ROBUSTO
  const keyExtractor = useCallback(
    (item: FeedItem, index: number) =>
      `${item.type}-${item._id ?? index}`,
    []
  );

  return (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}

      // 🔥 FAVORITES RE-RENDER
      extraData={favorites}

      // 🔥 PAGINATION
      onEndReached={() => {
        if (hasNextPage && !loadingMore) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}

      // 🔥 REFRESH
      refreshing={refreshing}
      onRefresh={refetch}

      // 🔥 UX
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}

      // 🔥 PERFORMANCE
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={5}

      // ❌ IMPORTANTE: evita bugs con overlays (ads incluidos)
      removeClippedSubviews={false}

      // 🔥 LOADING FOOTER
      ListFooterComponent={
        loadingMore ? <ActivityIndicator /> : null
      }
    />
  );
}

export default React.memo(DiscoverList);