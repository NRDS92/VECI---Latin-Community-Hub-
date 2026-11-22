import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { CommunityContentReport, ManagedCommunityMember, OwnerCommunity } from "@ndrs92/contracts";
import { applyCommunityMembershipAction, getMembershipRequests, getMembershipStatus, getOwnerCommunity, listCommunityReports, listManagedCommunityMembers, moderateCommunityContent, resolveCommunityReport } from "../../../src/features/communities/communities.api";

export default function CommunityManagementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [community, setCommunity] = useState<OwnerCommunity | null>(null);
  const [requests, setRequests] = useState<ManagedCommunityMember[]>([]);
  const [members, setMembers] = useState<ManagedCommunityMember[]>([]);
  const [reports, setReports] = useState<CommunityContentReport[]>([]);
  const [managerRole, setManagerRole] = useState<"owner" | "admin" | "member" | undefined>();
  const [loading, setLoading] = useState(true);
  const [busyUser, setBusyUser] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [owner, pending, active, membership, pendingReports] = await Promise.all([getOwnerCommunity(id), getMembershipRequests(id), listManagedCommunityMembers(id), getMembershipStatus(id), listCommunityReports(id)]);
      setCommunity(owner); setRequests(pending); setMembers(active); setManagerRole(membership.role); setReports(pendingReports);
    } catch (error) { Alert.alert("Unable to load management tools", error instanceof Error ? error.message : "Management access is required."); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const act = async (userId: string, action: "approve" | "reject" | "remove" | "ban" | "unban" | "assign_admin" | "revoke_admin") => {
    if (!id) return;
    setBusyUser(userId);
    try { await applyCommunityMembershipAction(id, userId, action); await load(); }
    catch (error) { Alert.alert("Action failed", error instanceof Error ? error.message : "Please try again."); }
    finally { setBusyUser(""); }
  };

  if (loading) return <View style={{ flex: 1, justifyContent: "center", backgroundColor: "#0B0F1A" }}><ActivityIndicator color="#FF7A00" /></View>;
  if (!community) return <View style={{ flex: 1, padding: 20, backgroundColor: "#0B0F1A" }}><Text style={{ color: "white" }}>Management access is unavailable.</Text></View>;

  const actionButton = (label: string, userId: string, action: Parameters<typeof act>[1]) => <Pressable disabled={busyUser === userId} onPress={() => void act(userId, action)} style={{ backgroundColor: "#273246", padding: 8, borderRadius: 8, marginRight: 7, marginTop: 7 }}><Text style={{ color: "white" }}>{busyUser === userId ? "…" : label}</Text></Pressable>;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0B0F1A" }} contentContainerStyle={{ padding: 18, paddingBottom: 110 }}>
      <Text style={{ color: "white", fontSize: 24, fontWeight: "800" }}>{community.name} · Manage</Text>
      <Text style={{ color: "#aab2c2", marginTop: 6 }}>Status: {community.moderationStatus} · {community.memberCount} active members</Text>
      <Pressable onPress={() => router.push({ pathname: "/community/edit/[id]", params: { id: community.id } })} style={{ alignSelf: "flex-start", backgroundColor: "#273246", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 9, marginTop: 12 }}><Text style={{ color: "white" }}>Edit Community profile</Text></Pressable>
      {community.moderationStatus !== "approved" ? <Text style={{ color: "#fbbf24", marginTop: 12 }}>This Community is not public until platform moderation approves it.</Text> : null}
      <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginTop: 24, marginBottom: 10 }}>Membership requests ({requests.length})</Text>
      {requests.map((member) => <View key={member.userId} style={{ backgroundColor: "#121826", padding: 13, borderRadius: 12, marginBottom: 9 }}><Text style={{ color: "white", fontWeight: "700" }}>{member.name}</Text><View style={{ flexDirection: "row" }}>{actionButton("Approve", member.userId, "approve")}{actionButton("Reject", member.userId, "reject")}</View></View>)}
      <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginTop: 22, marginBottom: 10 }}>Content reports ({reports.length})</Text>
      {reports.map((report) => <View key={report.id} style={{ backgroundColor: "#121826", padding: 13, borderRadius: 12, marginBottom: 9 }}><Text style={{ color: "white", fontWeight: "700" }}>{report.reason} · {report.targetType}</Text><View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        <Pressable onPress={async () => { try { await moderateCommunityContent(community.id, report.targetType, report.targetId, "hidden"); await resolveCommunityReport(community.id, report.id, "resolved"); setReports((items) => items.filter((item) => item.id !== report.id)); } catch { Alert.alert("Action failed", "Unable to moderate this report."); } }} style={{ backgroundColor: "#273246", padding: 8, borderRadius: 8, marginRight: 7, marginTop: 7 }}><Text style={{ color: "white" }}>Hide content</Text></Pressable>
        <Pressable onPress={async () => { try { await resolveCommunityReport(community.id, report.id, "dismissed"); setReports((items) => items.filter((item) => item.id !== report.id)); } catch { Alert.alert("Action failed", "Unable to dismiss this report."); } }} style={{ backgroundColor: "#273246", padding: 8, borderRadius: 8, marginTop: 7 }}><Text style={{ color: "white" }}>Dismiss</Text></Pressable>
      </View></View>)}
      <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginTop: 22, marginBottom: 10 }}>Members ({members.length})</Text>
      {members.map((member) => <View key={member.userId} style={{ backgroundColor: "#121826", padding: 13, borderRadius: 12, marginBottom: 9 }}><Text style={{ color: "white", fontWeight: "700" }}>{member.name}</Text><Text style={{ color: "#aab2c2", marginTop: 3 }}>{member.role} · {member.status}</Text><View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {member.status === "banned" ? actionButton("Unban", member.userId, "unban") : <>
          {managerRole === "owner" && member.role === "member" ? actionButton("Make admin", member.userId, "assign_admin") : managerRole === "owner" && member.role === "admin" ? actionButton("Revoke admin", member.userId, "revoke_admin") : null}
          {member.role !== "owner" && (managerRole === "owner" || member.role !== "admin") ? actionButton("Ban", member.userId, "ban") : null}
          {member.role !== "owner" && (managerRole === "owner" || member.role !== "admin") ? actionButton("Remove", member.userId, "remove") : null}
        </>}
      </View></View>)}
      {requests.length === 0 && members.length === 0 ? <Text style={{ color: "#aab2c2" }}>No members to manage.</Text> : null}
    </ScrollView>
  );
}
