import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import type { CommunityNotification } from "@ndrs92/contracts";
import { listCommunityNotifications, markCommunityNotificationRead } from "../../src/features/communities/communities.api";

export default function CommunityNotificationsScreen() {
  const [items, setItems] = useState<CommunityNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setItems(await listCommunityNotifications()); }
    catch (error) { Alert.alert("Unable to load notifications", error instanceof Error ? error.message : "Please try again."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const markRead = async (item: CommunityNotification) => {
    try { const updated = await markCommunityNotificationRead(item.id); setItems((previous) => previous.map((notification) => notification.id === updated.id ? updated : notification)); }
    catch { Alert.alert("Unable to update notification", "Please try again."); }
  };
  return <ScrollView style={{ flex: 1, backgroundColor: "#0B0F1A" }} contentContainerStyle={{ padding: 18, paddingBottom: 100 }}>
    <Text style={{ color: "white", fontSize: 24, fontWeight: "800", marginBottom: 18 }}>Community notifications</Text>
    {loading ? <ActivityIndicator color="#FF7A00" /> : items.length === 0 ? <Text style={{ color: "#aab2c2" }}>No notifications yet.</Text> : items.map((item) => <Pressable key={item.id} onPress={() => !item.readAt && void markRead(item)} style={{ backgroundColor: "#121826", borderRadius: 12, padding: 14, marginBottom: 9 }}><Text style={{ color: item.readAt ? "#aab2c2" : "white", fontWeight: "700" }}>{item.type.replaceAll("_", " ")}</Text><Text style={{ color: "#768092", marginTop: 5 }}>{new Date(item.createdAt).toLocaleString()}</Text></Pressable>)}
  </ScrollView>;
}
