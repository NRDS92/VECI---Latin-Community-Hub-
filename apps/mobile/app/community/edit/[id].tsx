import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import type { OwnerCommunity } from "@ndrs92/contracts";
import { getOwnerCommunity, updateCommunity } from "../../../src/features/communities/communities.api";
import { useAuth } from "../../../src/shared/context/AuthContext";

export default function EditCommunityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, setShowLoginModal } = useAuth();
  const [community, setCommunity] = useState<OwnerCommunity | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cityId, setCityId] = useState("");
  const [country, setCountry] = useState("");
  const [interests, setInterests] = useState("");
  const [membershipPolicy, setMembershipPolicy] = useState<"approval" | "open">("approval");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    if (!token) { setLoading(false); setShowLoginModal(true); return; }
    try {
      const current = await getOwnerCommunity(id);
      setCommunity(current);
      setName(current.name);
      setDescription(current.description ?? "");
      setCityId(current.cityId);
      setCountry(current.country);
      setInterests(current.interests.join(", "));
      setMembershipPolicy(current.membershipPolicy);
    } catch (error) {
      Alert.alert("Unable to load Community", error instanceof Error ? error.message : "Owner access is required.");
    } finally {
      setLoading(false);
    }
  }, [id, token, setShowLoginModal]);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    if (!community || !name.trim() || !cityId.trim() || !country.trim()) return;
    setSaving(true);
    try {
      const updated = await updateCommunity(community.id, {
        name, description, cityId, country, membershipPolicy,
        interests: interests.split(",").map((item) => item.trim()).filter(Boolean),
      });
      Alert.alert("Community updated", "Your profile changes have been saved.");
      router.replace({ pathname: "/community/[slug]", params: { slug: updated.slug } });
    } catch (error) {
      Alert.alert("Unable to update Community", error instanceof Error ? error.message : "Please check the information and try again.");
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, value: string, setValue: (next: string) => void, multiline = false) => (
    <View style={{ marginBottom: 12 }}><Text style={{ color: "#aab2c2", marginBottom: 5 }}>{label}</Text><TextInput value={value} onChangeText={setValue} multiline={multiline} style={{ color: "white", backgroundColor: "#121826", borderRadius: 12, padding: 13, minHeight: multiline ? 90 : 48 }} /></View>
  );

  if (loading) return <View style={{ flex: 1, justifyContent: "center", backgroundColor: "#0B0F1A" }}><ActivityIndicator color="#FF7A00" /></View>;
  if (!community) return <View style={{ flex: 1, padding: 20, backgroundColor: "#0B0F1A" }}><Text style={{ color: "white" }}>Community owner access is unavailable.</Text></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0B0F1A" }} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
      <Text style={{ color: "white", fontSize: 24, fontWeight: "800", marginBottom: 18 }}>Edit Community profile</Text>
      {field("Name *", name, setName)}
      {field("Description", description, setDescription, true)}
      {field("City *", cityId, setCityId)}
      {field("Country *", country, setCountry)}
      {field("Interests (comma separated)", interests, setInterests)}
      <Text style={{ color: "#aab2c2", marginBottom: 5 }}>Membership</Text>
      <View style={{ backgroundColor: "#121826", borderRadius: 12, marginBottom: 16 }}><Picker selectedValue={membershipPolicy} onValueChange={(value) => setMembershipPolicy(value)}><Picker.Item label="Request approval" value="approval" /><Picker.Item label="Open membership" value="open" /></Picker></View>
      <Pressable onPress={() => void save()} disabled={saving} style={{ backgroundColor: "#FF7A00", padding: 14, borderRadius: 12 }}>
        {saving ? <ActivityIndicator color="white" /> : <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Save changes</Text>}
      </Pressable>
    </ScrollView>
  );
}
