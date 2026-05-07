import { View, Text, Image, Pressable } from "react-native";
import { AdItem } from "../types/discover.types";

type Props = {
  item: Partial<AdItem>;
};

export default function AdCard({ item }: Props) {
  const title = item.title || "Latin Party this weekend 🔥";
  const subtitle =
    item.subtitle || "The best reggaeton & latin vibes in Cologne";
  const cta = item.cta || "Get tickets";

  return (
    <View
      style={{
        backgroundColor: "#fff",
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        elevation: 3,
      }}
    >
      {/* 🖼 IMAGE */}
      <View
        style={{
          height: 140,
          backgroundColor: "#ddd",
        }}
      >
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
          }}
          style={{ width: "100%", height: "100%" }}
        />

        {/* 🔥 SPONSORED BADGE */}
        <View
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "rgba(0,0,0,0.7)",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 11 }}>
            Sponsored
          </Text>
        </View>
      </View>

      {/* CONTENT */}
      <View style={{ padding: 14 }}>
        {/* TITLE */}
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          Reggaeton Night 🔥
        </Text>

        {/* SUBTITLE */}
        <Text style={{ marginTop: 4, color: "#666" }}>
          {subtitle}
        </Text>

        {/* CTA */}
        <Pressable
          style={{
            marginTop: 10,
            backgroundColor: "#FF7A00",
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: "center",
          }}
          onPress={() => {
            console.log("CTA clicked");
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {cta}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}