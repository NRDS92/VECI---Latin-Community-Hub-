import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { createCommunity } from "../../src/features/communities/communities.api";
import { useAuth } from "../../src/shared/context/AuthContext";

export default function CreateCommunityScreen() {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cityId, setCityId] = useState("");
  const [country, setCountry] = useState("Germany");
  const [interests, setInterests] = useState("");
  const [membershipPolicy, setMembershipPolicy] = useState<"approval" | "open">("approval");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const community = await createCommunity({
        name, description, cityId, country, membershipPolicy,
        interests: interests.split(",").map((item) => item.trim()).filter(Boolean),
      });
      Alert.alert("Community submitted", "Your Community is waiting for platform moderation.");
      router.replace({ pathname: "/community/[slug]", params: { slug: community.slug } });
    } catch (error) {
      Alert.alert("Unable to create Community", error instanceof Error ? error.message : "Please check the information and try again.");
    } finally {
      setBusy(false);
    }
  };

  const field = (label: string, value: string, setValue: (value: string) => void, multiline = false) => (
    <View style={{ marginBottom: 12 }}><Text style={{ color: "#aab2c2", marginBottom: 5 }}>{label}</Text><TextInput value={value} onChangeText={setValue} multiline={multiline} style={{ color: "white", backgroundColor: "#121826", borderRadius: 12, padding: 13, minHeight: multiline ? 90 : 48 }} /></View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0B0F1A" }} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
      <Text style={{ color: "white", fontSize: 24, fontWeight: "800", marginBottom: 18 }}>Create a Community</Text>
      {field("Name *", name, setName)}
      {field("Description", description, setDescription, true)}
      {field("City *", cityId, setCityId)}
      {field("Country *", country, setCountry)}
      {field("Interests (comma separated)", interests, setInterests)}
      <Text style={{ color: "#aab2c2", marginBottom: 5 }}>Membership</Text>
      <View style={{ backgroundColor: "#121826", borderRadius: 12, marginBottom: 16 }}><Picker selectedValue={membershipPolicy} onValueChange={(value) => setMembershipPolicy(value)}><Picker.Item label="Request approval" value="approval" /><Picker.Item label="Open membership" value="open" /></Picker></View>
      <Pressable onPress={submit} disabled={busy} style={{ backgroundColor: "#FF7A00", padding: 14, borderRadius: 12 }}>
        {busy ? <ActivityIndicator color="white" /> : <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Submit for review</Text>}
      </Pressable>
    </ScrollView>
  );
}
