import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";

type Business = {
  _id: string;
  name: string;
  category: string;
  subCategory?: string;
  priceRange?: "$" | "$$" | "$$$" | "$$$$";
  location?: {
    cityId?: string;
  };
  images?: {
    profile?: string;
    cover?: string;
  };
  rating?: {
    average: number;
    count: number;
  };
};

interface Props {
  item: Business;
}

export default function BusinessCard({ item }: Props) {
  const image = item.images?.cover || item.images?.profile;

  const handlePress = () => {
    router.push(`/business/${item._id}` as any);
  };

  const isFood =
    item.category === "food" ||
    ["restaurant", "cafe", "bar", "bakery"].includes(
      item.subCategory || ""
    );

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      {/* IMAGE */}
      {image && <Image source={{ uri: image }} style={styles.image} />}

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>

        {/* CATEGORY */}
        <Text style={styles.category}>
          {item.subCategory || item.category} • {item.location?.cityId}
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
    </TouchableOpacity>
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