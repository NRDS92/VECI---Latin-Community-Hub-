import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { CommunityComment, CommunityPost, MembershipRequest, PublicCommunity, PublicEvent } from "@ndrs92/contracts";
import { createCommunityComment, createCommunityPost, getMembershipStatus, getPublicCommunityBySlug, getPublicCommunityEvents, listCommunityComments, listCommunityPosts, reportCommunityContent, requestCommunityMembership } from "../../src/features/communities/communities.api";
import { useAuth } from "../../src/shared/context/AuthContext";

export default function CommunityPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { token, setShowLoginModal } = useAuth();
  const [community, setCommunity] = useState<PublicCommunity | null>(null);
  const [membership, setMembership] = useState<MembershipRequest | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [eventsUnavailable, setEventsUnavailable] = useState(false);
  const [text, setText] = useState("");
  const [postType, setPostType] = useState<"post" | "announcement">("post");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const publicCommunity = await getPublicCommunityBySlug(slug);
      setCommunity(publicCommunity);
      try {
        setEvents(await getPublicCommunityEvents(publicCommunity.id));
        setEventsUnavailable(false);
      } catch {
        setEvents([]);
        setEventsUnavailable(true);
      }
      if (token) {
        const status = await getMembershipStatus(publicCommunity.id);
        setMembership(status);
        setPosts(status.status === "active" ? await listCommunityPosts(publicCommunity.id) : []);
      } else {
        setMembership(null);
        setPosts([]);
      }
    } catch (error) {
      Alert.alert("Unable to load Community", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [slug, token]);

  useEffect(() => { void load(); }, [load]);

  const join = async () => {
    if (!token) { setShowLoginModal(true); return; }
    if (!community) return;
    setPending(true);
    try {
      const status = await requestCommunityMembership(community.id);
      setMembership(status);
      if (status.status === "active") setPosts(await listCommunityPosts(community.id));
    }
    catch (error) { Alert.alert("Unable to join", error instanceof Error ? error.message : "Please try again."); }
    finally { setPending(false); }
  };

  const submitPost = async () => {
    if (!community || !text.trim()) return;
    setPending(true);
    try {
      const post = await createCommunityPost(community.id, { text, type: postType });
      setPosts((previous) => [post, ...previous]);
      setText("");
    } catch (error) { Alert.alert("Unable to publish", error instanceof Error ? error.message : "Please try again."); }
    finally { setPending(false); }
  };

  if (loading) return <View style={{ flex: 1, justifyContent: "center", backgroundColor: "#0B0F1A" }}><ActivityIndicator color="#FF7A00" /></View>;
  if (!community) return <View style={{ flex: 1, padding: 20, backgroundColor: "#0B0F1A" }}><Text style={{ color: "white" }}>Community is not available.</Text></View>;
  const canManage = membership?.status === "active" && ["owner", "admin"].includes(membership.role ?? "");
  const membershipLabel = membership?.status === "active" ? "Member" : membership?.status === "pending" ? "Request pending" : membership?.status === "banned" ? "Membership unavailable" : "Join Community";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0B0F1A" }} contentContainerStyle={{ padding: 18, paddingBottom: 110 }}>
      <Pressable onPress={() => router.back()}><Text style={{ color: "#FF9B43", marginBottom: 16 }}>← Back</Text></Pressable>
      <Text style={{ color: "white", fontSize: 27, fontWeight: "800" }}>{community.name}</Text>
      <Text style={{ color: "#aab2c2", marginTop: 5 }}>{community.cityId}, {community.country} · {community.memberCount} members</Text>
      {community.description ? <Text style={{ color: "white", lineHeight: 22, marginTop: 14 }}>{community.description}</Text> : null}
      {community.interests.length ? <Text style={{ color: "#aab2c2", marginTop: 10 }}>{community.interests.join(" · ")}</Text> : null}
      <Text style={{ color: "white", fontSize: 19, fontWeight: "700", marginTop: 24 }}>Community events</Text>
      {eventsUnavailable ? <Text style={{ color: "#aab2c2", marginTop: 8 }}>Community events are temporarily unavailable.</Text> : events.length ? events.map((event) => <Pressable key={event.id} onPress={() => router.push({ pathname: "/event/[id]", params: { id: event.id } })} style={{ backgroundColor: "#121826", borderRadius: 12, padding: 14, marginTop: 9 }}><Text style={{ color: "white", fontWeight: "700" }}>{event.title}</Text><Text style={{ color: "#aab2c2", marginTop: 4 }}>{new Date(event.dateStart).toLocaleString()} · {event.address}</Text></Pressable>) : <Text style={{ color: "#aab2c2", marginTop: 8 }}>No upcoming Community events.</Text>}
      {membership?.status !== "active" ? <Pressable onPress={join} disabled={pending || membership?.status === "banned"} style={{ marginTop: 18, backgroundColor: "#FF7A00", borderRadius: 12, padding: 13 }}><Text style={{ textAlign: "center", color: "white", fontWeight: "700" }}>{pending ? "Please wait…" : membershipLabel}</Text></Pressable> : null}
      {canManage ? <Pressable onPress={() => router.push({ pathname: "/community/manage/[id]", params: { id: community.id } })} style={{ marginTop: 10, padding: 10 }}><Text style={{ color: "#FF9B43" }}>Manage community</Text></Pressable> : null}
      {membership?.status === "active" ? <View style={{ marginTop: 26 }}>
        <Text style={{ color: "white", fontSize: 19, fontWeight: "700", marginBottom: 10 }}>Private Community Forum</Text>
        <View style={{ backgroundColor: "#121826", borderRadius: 12, padding: 12, marginBottom: 12 }}>
          {canManage ? <Pressable onPress={() => setPostType((value) => value === "post" ? "announcement" : "post")}><Text style={{ color: "#FF9B43", marginBottom: 6 }}>{postType === "announcement" ? "Announcement (tap to switch)" : "Member post (tap for announcement)"}</Text></Pressable> : null}
          <TextInput value={text} onChangeText={setText} placeholder="Share with members" placeholderTextColor="#768092" multiline style={{ color: "white", minHeight: 56 }} />
          <Pressable onPress={submitPost} disabled={pending} style={{ alignSelf: "flex-end", backgroundColor: "#FF7A00", borderRadius: 8, paddingHorizontal: 13, paddingVertical: 8 }}><Text style={{ color: "white" }}>Post</Text></Pressable>
        </View>
        {posts.map((post) => <CommunityPostCard key={post.id} communityId={community.id} post={post} />)}
        {posts.length === 0 ? <Text style={{ color: "#aab2c2" }}>No posts yet.</Text> : null}
      </View> : null}
    </ScrollView>
  );
}

function CommunityPostCard({ communityId, post }: { communityId: string; post: CommunityPost }) {
  const { token, setShowLoginModal } = useAuth();
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    if (!token) { setShowLoginModal(true); return; }
    if (!open) {
      setBusy(true);
      try { setComments(await listCommunityComments(communityId, post.id)); }
      catch (error) { Alert.alert("Unable to load comments", error instanceof Error ? error.message : "Please try again."); }
      finally { setBusy(false); }
    }
    setOpen((value) => !value);
  };
  const submitComment = async () => {
    if (!comment.trim()) return;
    setBusy(true);
    try { const created = await createCommunityComment(communityId, post.id, { text: comment }); setComments((items) => [...items, created]); setComment(""); }
    catch (error) { Alert.alert("Unable to comment", error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  };
  const report = async () => {
    try { await reportCommunityContent(communityId, { targetType: "post", targetId: post.id, reason: "other" }); Alert.alert("Report submitted", "Community managers will review this post."); }
    catch (error) { Alert.alert("Unable to report", error instanceof Error ? error.message : "Please try again."); }
  };
  return <View style={{ backgroundColor: "#121826", borderRadius: 12, padding: 14, marginBottom: 10 }}>
    <Text style={{ color: "#FF9B43", fontWeight: "700" }}>{post.author.name}{post.type === "announcement" ? " · Announcement" : ""}</Text>
    <Text style={{ color: "white", marginTop: 8, lineHeight: 21 }}>{post.text}</Text>
    <Text style={{ color: "#768092", marginTop: 8 }}>{new Date(post.createdAt).toLocaleString()}</Text>
    <View style={{ flexDirection: "row", gap: 16, marginTop: 10 }}><Pressable onPress={() => void toggle()}><Text style={{ color: "#FF9B43" }}>{open ? "Hide comments" : "Comments"}</Text></Pressable><Pressable onPress={() => void report()}><Text style={{ color: "#aab2c2" }}>Report</Text></Pressable></View>
    {open ? <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: "#273246", paddingTop: 8 }}>
      {comments.map((item) => <View key={item.id} style={{ marginBottom: 8 }}><Text style={{ color: "#FF9B43", fontWeight: "600" }}>{item.author.name}</Text><Text style={{ color: "white", marginTop: 2 }}>{item.text}</Text></View>)}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><TextInput value={comment} onChangeText={setComment} placeholder="Write a comment" placeholderTextColor="#768092" style={{ color: "white", flex: 1, backgroundColor: "#1A2233", borderRadius: 8, padding: 9 }} /><Pressable disabled={busy} onPress={() => void submitComment()}><Text style={{ color: "#FF9B43" }}>Send</Text></Pressable></View>
      {busy ? <ActivityIndicator color="#FF7A00" style={{ marginTop: 5 }} /> : null}
    </View> : null}
  </View>;
}
