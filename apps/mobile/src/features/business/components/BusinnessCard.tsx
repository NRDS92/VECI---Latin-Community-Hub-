import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import type { PublicBusiness } from "@ndrs92/contracts";

interface Props {
  item: PublicBusiness;
}

export default function BusinessCard({ item }: Props) {
  const image = item.coverImage || item.image;
  const slug = item.slug;
  const canOpen = Boolean(slug?.trim());

  const isFood =
    item.category === "food" ||
    ["restaurant", "cafe", "bar", "bakery"].includes(
      item.subCategory || ""
    );

  return (
    <Pressable
      style={styles.card}
      disabled={!canOpen}
      accessibilityRole={canOpen ? "link" : undefined}
      onPress={() => {
        if (canOpen) {
          router.push({ pathname: "/business/public/[slug]", params: { slug } });
        }
      }}
    >
      {/* IMAGE */}
      {image && <Image source={{ uri: image }} style={styles.image} />}

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>

        {/* CATEGORY */}
        <Text style={styles.category}>
          {item.subCategory || item.category} • {item.cityId}
        </Text>

        {/* PRICE (solo food) */}
        {isFood && item.priceRange && (
          <Text style={styles.price}>{item.priceRange}</Text>
        )}

        {/* RATING */}
        {item.rating?.count ? (
          <Text style={styles.meta}>
            ⭐ {item.rating.average.toFixed(1)} ({item.rating.count})
          </Text>
        ) : (
          <Text style={styles.meta}>New place 🚀</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#121826",
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 150,
  },

  content: {
    padding: 12,
  },

  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  category: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },

  price: {
    color: "#22c55e",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },

  meta: {
    color: "#FF7A00",
    fontSize: 12,
    marginTop: 6,
  },
});
