import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function MyBusinessCard({ item, onDelete }: any) {
  const image = item.images?.profile;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/business/${item._id}`)}
    >
      {/* IMAGE */}
      <Image
        source={{
          uri:
            image ||
            "https://via.placeholder.com/400x300",
        }}
        style={styles.image}
      />

      {/* CONTENT */}
      <View style={styles.content}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </View>

          {/* ACTIONS */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                router.push(`/business/${item._id}?edit=true`);
              }}
            >
              <MaterialIcons name="edit" size={20} color="#FF7A00" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onDelete(item._id);
              }}
            >
              <MaterialIcons name="delete-outline" size={20} color="#ff4d4d" />
            </TouchableOpacity>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.cta}
          onPress={(e) => {
            e.stopPropagation();
            router.push({
              pathname: "/(tabs)/create-event",
              params: {
                businessId: item._id,
                mode: "business",
              },
            });
          }}
        >
          <MaterialIcons name="add" size={16} color="#fff" />
          <Text style={styles.ctaText}>Create Event</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#121826",
    marginHorizontal: 12,
    marginTop: 14,
    borderRadius: 18,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 140,
  },

  content: {
    padding: 14,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  category: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },

  actions: {
    flexDirection: "row",
    gap: 14,
  },

  cta: {
    marginTop: 14,
    backgroundColor: "#FF7A00",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  ctaText: {
    color: "#fff",
    fontWeight: "600",
  },
});