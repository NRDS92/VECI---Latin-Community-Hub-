import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

type Props = {
  item: any;
  onDelete: (id: string) => void;
};

export default function MyEventCard({ item, onDelete }: Props) {
  const image = item.images?.[0];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/event/${item._id}`)}
    >
      {/* IMAGE */}
      <Image
        source={{
          uri: image || "https://via.placeholder.com/300x200",
        }}
        style={styles.image}
      />

      {/* CONTENT */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>

          {/* BADGE */}
          <View
            style={[
              styles.badge,
              item.eventType === "official"
                ? styles.official
                : styles.community,
            ]}
          >
            <Text style={styles.badgeText}>
              {item.eventType === "official" ? "Official" : "Community"}
            </Text>
          </View>
        </View>

        {/* DATE */}
        <View style={styles.row}>
          <MaterialIcons name="event" size={14} color="#9ca3af" />
          <Text style={styles.date}>
            {new Date(item.dateStart).toLocaleDateString()}
          </Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/event/[id]",
                params: { id: item._id, edit: "true" },
              })
            }
          >
            <MaterialIcons name="edit" size={20} color="#FF7A00" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onDelete(item._id)}>
            <MaterialIcons name="delete-outline" size={20} color="#ff4d4d" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#121826",
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 140,
  },

  content: {
    padding: 12,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  date: {
    color: "#9ca3af",
    marginLeft: 6,
    fontSize: 12,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 10,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  official: {
    backgroundColor: "#22c55e",
  },

  community: {
    backgroundColor: "#334155",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});