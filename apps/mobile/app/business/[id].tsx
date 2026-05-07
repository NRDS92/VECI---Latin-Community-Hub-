import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useBusiness } from "../../src/features/business/hooks/useCreateBusiness";
import { useAuth } from "../../src/shared/context/AuthContext";

export default function BusinessPublicScreen() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError } = useBusiness(id);


  const openLink = (url?: string) => {
    if (!url) return;
    Linking.openURL(url);
  };

  const openMaps = () => {
    const { lat, lng } = data?.location?.coordinates || {};
    if (!lat || !lng) return;

    Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FF7A00" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Error loading business</Text>
      </View>
    );
  }
    const ownerId =
      typeof data.owner === "object"
        ? data.owner?._id
        : data.owner;

    const userId = (user as any)?._id || user?.id;

    const isOwner =
      userId &&
      ownerId &&
      userId.toString() === ownerId.toString();

    const isFood =
      data.category === "food" ||
      ["restaurant", "cafe", "bar", "bakery"].includes(
        data.subCategory || ""
      );

    const { lat, lng } = data.location?.coordinates || {};

  return (
    <ScrollView style={styles.container}>
      {/* IMAGE */}
      {(data.images?.cover || data.images?.profile) && (
        <Image
          source={{ uri: data.images.cover || data.images.profile }}
          style={styles.cover}
        />
      )}

      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>{data.name}</Text>

          {isOwner && (
            <TouchableOpacity
              onPress={() =>
                router.push(`/business/CreateBusinessScreen?id=${id}`)
              }
            >
              <MaterialIcons name="edit" size={22} color="#FF7A00" />
            </TouchableOpacity>
          )}
        </View>

        {/* CATEGORY */}
        <Text style={styles.category}>
          {data.subCategory || data.category} • {data.location?.cityId}
        </Text>

        {/* PRICE */}
        {isFood && data.priceRange && (
          <Text style={styles.price}>{data.priceRange}</Text>
        )}

        {/* LOCATION TEXT */}
        <Text style={styles.meta}>📍 {data.location?.address}</Text>

        {/* MAP PREVIEW */}
        {lat && lng && (
          <TouchableOpacity onPress={openMaps}>
            <Image
              source={{
                uri: `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${lng},${lat}&z=15&size=650,300&l=map&pt=${lng},${lat},pm2rdm`,
              }}
              style={styles.map}
            />
          </TouchableOpacity>
        )}

        {/* CONTACT ICONS */}
        <View style={styles.contactRow}>
          {data.contact?.instagram && (
            <TouchableOpacity
              onPress={() =>
                openLink(`https://instagram.com/${data.contact.instagram}`)
              }
            >
              <FontAwesome name="instagram" size={22} color="#E1306C" />
            </TouchableOpacity>
          )}

          {data.contact?.website && (
            <TouchableOpacity
              onPress={() => openLink(data.contact.website)}
            >
              <Ionicons name="globe-outline" size={22} color="#fff" />
            </TouchableOpacity>
          )}

          {data.contact?.phone && (
            <TouchableOpacity
              onPress={() => openLink(`tel:${data.contact.phone}`)}
            >
              <Ionicons name="call-outline" size={22} color="#22c55e" />
            </TouchableOpacity>
          )}

          {data.contact?.whatsapp && (
            <TouchableOpacity
              onPress={() =>
                openLink(`https://wa.me/${data.contact.whatsapp}`)
              }
            >
              <FontAwesome name="whatsapp" size={22} color="#25D366" />
            </TouchableOpacity>
          )}
        </View>

        {/* DESCRIPTION */}
        {data.description && (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{data.description}</Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F1A" },

  cover: { width: "100%", height: 250 },

  content: { padding: 16 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: { color: "#fff", fontSize: 24, fontWeight: "700" },

  category: { color: "#FF7A00", marginTop: 6 },

  price: { color: "#22c55e", marginTop: 4 },

  meta: { color: "#9ca3af", marginTop: 6 },

  map: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 12,
  },

  contactRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 16,
    alignItems: "center",
  },

  sectionTitle: {
    color: "#fff",
    marginTop: 20,
    fontWeight: "600",
  },

  description: { color: "#9ca3af", marginTop: 6 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B0F1A",
  },
});