import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import type { MyCommunity, PublicCommunity } from "@ndrs92/contracts";
import { discoverCommunities, getMyCommunities } from "../../src/features/communities/communities.api";
import { useAuth } from "../../src/shared/context/AuthContext";

export default function CommunitiesScreen() {
  const { token, setShowLoginModal } = useAuth();
  const [communities, setCommunities] = useState<PublicCommunity[]>([]);
  const [mine, setMine] = useState<MyCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const [publicItems, myItems] = await Promise.all([
        discoverCommunities(),
        token ? getMyCommunities() : Promise.resolve([]),
      ]);
      setCommunities(publicItems);
      setMine(myItems);
    } catch {
      setError("Communities could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  useEffect(() => { if (!token) setMine([]); }, [token]);

  const openCommunity = (slug: string) => router.push({ pathname: "/community/[slug]", params: { slug } });
  const CommunityRow = ({ community, role }: { community: PublicCommunity; role?: string }) => (
    <Pressable onPress={() => openCommunity(community.slug)} style={{ backgroundColor: "#121826", borderRadius: 14, padding: 16, marginBottom: 10 }}>
      <Text style={{ color: "white", fontSize: 17, fontWeight: "700" }}>{community.name}</Text>
      <Text style={{ color: "#aab2c2", marginTop: 4 }}>{community.cityId}, {community.country}</Text>
      <Text style={{ color: "#aab2c2", marginTop: 6 }}>{community.memberCount} members{role ? ` · ${role}` : ""}</Text>
    </Pressable>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0B0F1A" }} contentContainerStyle={{ padding: 18, paddingBottom: 110 }}>
      <Text style={{ color: "white", fontSize: 25, fontWeight: "800", marginBottom: 14 }}>Communities</Text>
      {token ? <Pressable onPress={() => router.push("/community/notifications")} style={{ marginBottom: 14 }}><Text style={{ color: "#FF9B43", textAlign: "right" }}>Notifications</Text></Pressable> : null}
      <Pressable onPress={() => token ? router.push("/community/create") : setShowLoginModal(true)} style={{ backgroundColor: "#FF7A00", borderRadius: 12, padding: 13, marginBottom: 24 }}>
        <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Create a Community</Text>
      </Pressable>
      {loading ? <ActivityIndicator color="#FF7A00" /> : null}
      {error ? <Text accessibilityRole="alert" style={{ color: "#fca5a5", marginBottom: 18 }}>{error}</Text> : null}
      {mine.length > 0 ? <View><Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginBottom: 10 }}>My communities</Text>{mine.map((item) => <CommunityRow key={item.id} community={item} role={item.membershipRole} />)}</View> : null}
      <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginTop: 18, marginBottom: 10 }}>Discover</Text>
      {!loading && communities.length === 0 ? <Text style={{ color: "#aab2c2" }}>No public communities yet.</Text> : null}
      {communities.map((item) => <CommunityRow key={item.id} community={item} />)}
    </ScrollView>
  );
}
