import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

type Props = {
  item: any;
  onToggle: (id: string) => void;
  isFavorite: boolean;
};

export default function EventCard({ item, onToggle, isFavorite }: Props) {
  const eventImage = item.images?.[0];

  const isOfficial = item.eventType === "official";

  const avatarImage = isOfficial
    ? item.businessId?.images?.profile
    : item.createdBy?.profileImage;

  return (
    <TouchableOpacity
      style={styles.cardActive}
      activeOpacity={0.9}
      onPress={() => {
        router.push({
          pathname: "/event/[id]",
          params: { id: item._id },
        });
      }}
    >
      <ImageBackground
        source={{
          uri:
            eventImage ||
            "https://via.placeholder.com/400x200?text=No+Image",
        }}
        style={styles.card}
        imageStyle={{ borderRadius: 20 }}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={StyleSheet.absoluteFill}
        />

        {/* ❤️ FAVORITE */}
        <TouchableOpacity
          onPress={() => onToggle(item._id)}
          style={styles.favoriteBtn}
        >
          <Text style={{ fontSize: 16 }}>
            {isFavorite ? "❤️" : "🤍"}
          </Text>
        </TouchableOpacity>

        {/* 👤 / 🏪 AVATAR */}
        {avatarImage && (
          <ImageBackground
            source={{ uri: avatarImage }}
            style={styles.avatar}
            imageStyle={{ borderRadius: 20 }}
          />
        )}

        {/* CONTENT */}
        <View style={styles.content}>
          {isOfficial ? (
            <>
              {/* 🏪 BUSINESS NAME (MAIN) */}
              <Text style={styles.businessName}>
                {item.businessId?.name?.toUpperCase() || "BUSINESS"}
              </Text>

              <Text style={styles.businessCategory}>
                {item.businessId?.category}
              </Text>

              {/* 🎉 EVENT TITLE */}
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>

              <Text style={styles.subtitle}>
                {item.category} • {item.cityId}
              </Text>

              <Text style={styles.date}>
                {new Date(item.dateStart).toLocaleDateString()}
              </Text>
            </>
          ) : (
            <>
              {/* 👤 USER NAME */}
              <Text style={styles.organizer}>
                👤 {item.createdBy?.name || "User"}
              </Text>

              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>

              <Text style={styles.subtitle}>
                {item.category} • {item.cityId}
              </Text>

              <Text style={styles.date}>
                {new Date(item.dateStart).toLocaleDateString()}
              </Text>
            </>
          )}

          {/* BADGES */}
          <View style={styles.badges}>
            {isOfficial && (
              <View style={styles.badgeOfficial}>
                <Text style={styles.badgeText}>🏪 Official</Text>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardActive: {
    marginBottom: 18,
  },

  card: {
    height: 220,
    justifyContent: "flex-end",
    borderRadius: 20,
    overflow: "hidden",
  },

  favoriteBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
  },

  avatar: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
  },

  content: {
    padding: 14,
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },

  subtitle: {
    color: "#d1d5db",
    marginTop: 4,
    fontSize: 13,
  },

  date: {
    color: "#9ca3af",
    marginTop: 4,
    fontSize: 12,
  },

  organizer: {
    color: "#fff",
    marginTop: 4,
    fontSize: 12,
    opacity: 0.8,
  },

  // 🔥 BUSINESS STYLES
  businessName: {
    color: "#FF7A00",
    fontSize: 14,
    fontWeight: "700",
  },

  businessCategory: {
    color: "#d1d5db",
    fontSize: 12,
    marginTop: 2,
  },

  owner: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 2,
  },

  badges: {
    flexDirection: "row",
    marginTop: 8,
  },

  badgeOfficial: {
    backgroundColor: "#FF7A00",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 6,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
});