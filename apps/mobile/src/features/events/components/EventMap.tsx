import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
  View,
  Text,
} from "react-native";

type Props = {
  location: any;
  address?: string;
};

function EventMap({ location, address }: Props) {
  if (!location?.coordinates) return null;

  let lat: number | undefined;
  let lng: number | undefined;

  // ✅ Mongo format [lng, lat]
  if (Array.isArray(location.coordinates)) {
    lng = location.coordinates[0];
    lat = location.coordinates[1];
  } else {
    lat = location.coordinates?.lat;
    lng = location.coordinates?.lng;
  }

  if (lat == null || lng == null) return null;

  const openMaps = () => {
    Linking.openURL(
      `https://www.google.com/maps?q=${lat},${lng}`
    );
  };

  const mapUrl = `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${lng},${lat}&z=15&size=650,300&l=map&pt=${lng},${lat},pm2rdm`;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={openMaps}
    >
      {/* 🗺 MAP */}
      <Image
        source={{ uri: mapUrl }}
        style={styles.map}
        resizeMode="cover"
      />

      {/* 🔥 OVERLAY */}
      <View style={styles.overlay}>
        <Text style={styles.title}>
          📍 Event Location
        </Text>

        {!!address && (
          <Text
            style={styles.address}
            numberOfLines={2}
          >
            {address}
          </Text>
        )}

        <View style={styles.button}>
          <Text style={styles.buttonText}>
            Open in Google Maps
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(EventMap);

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#111827",
  },

  map: {
    width: "100%",
    height: 200,
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    padding: 16,

    backgroundColor: "rgba(0,0,0,0.35)",
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  address: {
    color: "#d1d5db",
    marginTop: 6,
    fontSize: 13,
  },

  button: {
    marginTop: 12,
    backgroundColor: "#FF7A00",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});