import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Linking,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";

import { GEOAPIFY_API_KEY } from "../../src/config/env";

type Props = {
  onSelect: (data: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;

  initialAddress?: string;
};

export default function LocationPicker({
  onSelect,
  initialAddress = "",
}: Props) {
  const [query, setQuery] = useState(initialAddress);

  const [loading, setLoading] = useState(false);

  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  // ✅ AUTO SEARCH WITH DEBOUNCE
  useEffect(() => {
    if (!query.trim()) {
      setLocation(null);
      return;
    }

    const timeout = setTimeout(() => {
      searchLocation(query);
    }, 700);

    return () => clearTimeout(timeout);
  }, [query]);

  // ✅ SEARCH LOCATION
  const searchLocation = async (searchText: string) => {
    try {
      setLoading(true);

      const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        searchText
      )}&apiKey=${GEOAPIFY_API_KEY}`;

      const response = await fetch(url);

      const data = await response.json();

      const feature = data?.features?.[0];

      if (!feature) {
        return;
      }

      const lat = Number(feature.properties.lat);
      const lng = Number(feature.properties.lon);

      const address = feature.properties.formatted;

      const locationData = {
        lat,
        lng,
        address,
      };

      setLocation(locationData);

      onSelect({
        address,
        latitude: lat,
        longitude: lng,
      });
    } catch (error) {
      console.log("LOCATION SEARCH ERROR", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ OPEN EXTERNAL MAPS
  const openMaps = () => {
    if (!location) return;

    const url = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;

    Linking.openURL(url);
  };

  // ✅ STATIC MAP
  const staticMapUrl = useMemo(() => {
    if (!location) return null;

    return `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=800&height=400&center=lonlat:${location.lng},${location.lat}&zoom=15&marker=lonlat:${location.lng},${location.lat};color:%23ff7a00;size:medium&apiKey=${GEOAPIFY_API_KEY}`;
  }, [location]);

  return (
    <View>
      {/* INPUT */}
      <TextInput
        placeholder="Search address..."
        placeholderTextColor="#6b7280"
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

      {/* LOADING */}
      {loading && (
        <ActivityIndicator
          style={{ marginTop: 16 }}
          color="#FF7A00"
        />
      )}

      {/* MAP */}
      {!!location && !!staticMapUrl && (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.mapContainer}
          onPress={openMaps}
        >
          <Image
            source={{ uri: staticMapUrl }}
            style={styles.map}
            resizeMode="cover"
          />

          {/* OVERLAY */}
          <View style={styles.overlay}>
            <Text style={styles.title}>
              📍 Selected Location
            </Text>

            <Text
              style={styles.address}
              numberOfLines={2}
            >
              {location.address}
            </Text>

            <Text style={styles.coordinates}>
              {location.lat.toFixed(5)},{" "}
              {location.lng.toFixed(5)}
            </Text>

            <View style={styles.mapsButton}>
              <Text style={styles.mapsButtonText}>
                Open in Maps
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
  },

  mapContainer: {
    marginTop: 18,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#111827",
    marginBottom: 16,
    height: 240,
  },

  map: {
    width: "100%",
    height: "100%",
  },

  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    padding: 16,

    backgroundColor: "rgba(0,0,0,0.45)",
  },

  title: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  address: {
    color: "#e5e7eb",
    marginTop: 6,
    fontSize: 13,
  },

  coordinates: {
    color: "#9ca3af",
    marginTop: 4,
    fontSize: 12,
  },

  mapsButton: {
    marginTop: 12,
    backgroundColor: "#FF7A00",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },

  mapsButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});