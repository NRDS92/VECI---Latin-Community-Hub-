import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useFavorites } from "../../src/features/discover/hoooks/useFavorites";
import { useFavoriteEvents } from "../../src/features/user/hooks/useFavoritesEvents";

import EventCard from "../../src/features/events/components/EventCard";

export default function FavoritesScreen() {
  const { handleToggle, isFavorite } = useFavorites();

  const {
    data: favoriteEvents = [],
    isLoading,
    refetch,
  } = useFavoriteEvents();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Favorites</Text>

      {isLoading ? (
        <ActivityIndicator color="#FF7A00" />
      ) : favoriteEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💔</Text>

          <Text style={styles.emptyTitle}>
            No favorites yet
          </Text>

          <Text style={styles.emptySubtitle}>
            Save events you love and find them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteEvents}
          keyExtractor={(item) =>
            item._id.toString()
          }
          renderItem={({ item }) => (
            <EventCard
              item={item}
              onToggle={handleToggle}
              isFavorite={isFavorite(item._id)}
            />
          )}
          onRefresh={refetch}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F1A",
    paddingHorizontal: 16,
    paddingTop: 60,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  emptySubtitle: {
    color: "#9ca3af",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 30,
  },
});