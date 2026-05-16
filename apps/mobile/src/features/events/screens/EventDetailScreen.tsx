import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEvent, useUpdateEvent } from "../hooks/useEvents";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import { uploadEventImage } from "../services/uploadEventImage.service";
import { useAuth } from "../../../shared/context/AuthContext";

import EventHeader from "../components/EventHeader";
import EventInfo from "../components/EventInfo";
import EventOrganizer from "../components/EventOrganizer";
import EventDescription from "../components/EventDescription";
import EventGoodToKnow from "../components/EventGoodToKnow";
import EventContact from "../components/EventContact";
import EventStats from "../components/EventStats";
import MiniEventCard from "../components/MiniEventCard";

import EventDateCard from "../components/EventDateCard";

import { useEventTracking } from "../hooks/useEventTracking";

export default function EventDetailScreen() {
  const queryClient = useQueryClient();
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const { id, edit } = useLocalSearchParams<{ id: string | string[]; edit?: string }>();
  const eventId = Array.isArray(id) ? id[0] : id;
  const isEditing = edit === "true";

  const { data, isLoading, isError } = useEvent(eventId as string)
  const updateMutation = useUpdateEvent();
  const insets = useSafeAreaInsets();

  const {
    token,
    setShowLoginModal,
    setPendingAction,
  } = useAuth();

  const { trackView, attend, isAttendingLoading } = useEventTracking();

  const [form, setForm] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);

  const event = data;
  const isAttending = event?.userContext?.isAttending;
  const related = data?.related || [];
  const coordinates = event?.location?.coordinates;

  const lat = Array.isArray(coordinates) ? coordinates[1] : coordinates?.lat;
  const lng = Array.isArray(coordinates) ? coordinates[0] : coordinates?.lng;

  // 🔥 NORMALIZE DATA
  useEffect(() => {
  if (!event) return;

  setForm({
      ...event,

      // 🔥 CRÍTICOS
      title: event.title || "",
      description: event.description || "",
      categories: event.categories || [],

      stats: {
        views: event.stats?.views || 0,
        attendees: event.stats?.attendees || 0,
      },

      images: (event.images || []).map((img: any) =>
        typeof img === "string" ? img : img?.url || img?.uri || ""
      ),

      contact: {
        website: event.contact?.website || "",
        instagram: event.contact?.instagram || "",
        whatsapp: event.contact?.whatsapp || "",
      },

      goodToKnow: event.goodToKnow || [],
    });
  }, [event]);

  // 🔥 TRACK VIEW
  useEffect(() => {
    if (eventId) trackView(eventId);
  }, [eventId]);

  const updateField = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleChangeImage = async (uri: string) => {
    try {
      if (!token) return;

      setIsUploading(true);
      const imageUrl = await uploadEventImage(uri, token);
      updateField("images", [imageUrl]);
    } catch (error) {
      console.log("❌ upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    updateMutation.mutate(
      { id, data: form },
      { onSuccess: () => router.back() }
    );
  };

  const handleAttend = async () => {
    if (!eventId) return;

    if (!token) {
      setPendingAction(() => () => handleAttend());
      setShowLoginModal(true);
      return;
    }

    try {
      await attend(eventId);

      // 🔥 REFETCH → sincroniza con backend
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });

    } catch (error) {
      console.log("❌ ATTEND FAILED", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FF7A00" />
      </View>
    );
  }

  if (isError || !event) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Error loading event</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1 }}>
        {/* BACK */}
        <View style={[styles.backButtonContainer, { top: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >          
          <EventHeader
            image={form.images?.[0]}
            title={form.title}
            date={form.dateStart} // 🔥 importante
            topInset={insets.top}
            isEditing={isEditing}
            onChangeTitle={(val: string) => updateField("title", val)}
            onChangeImage={handleChangeImage}
          />
    
          <Animated.View
            style={[
              styles.cardContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* STATS + CTA */}
            <View style={styles.rowBetween}>
              <EventStats
                views={form.stats?.views}
                attendees={form.stats?.attendees}
              />

              <TouchableOpacity
  style={[
    styles.attendButton,
    isAttending && { backgroundColor: "#16a34a" },
    isAttendingLoading && { opacity: 0.7 },
  ]}
  onPress={handleAttend}
  disabled={isAttendingLoading}
>
  <Text style={styles.attendText}>
    {!token
      ? "Login to attend"
      : isAttendingLoading
      ? "Loading..."
      : isAttending
      ? "Going ✅"
      : "Attend"}
  </Text>
</TouchableOpacity>
            </View>

            {/* ORGANIZER */}
            <View style={styles.section}>
              <EventOrganizer
                organizer={event.createdBy || event.businessId}
              />
            </View>
             
              {/* DESCRIPTION */}
              <View style={styles.section}>
                <EventDescription
                  description={form.description || ""}
                  isEditing={isEditing}
                  onChangeDescription={(val: string) =>
                    updateField("description", val)
                  }
                  onChangeCategories={(val: string[]) =>
                    updateField("categories", val)
                  }
                  event={form || {}}
                />
              </View>

            {/* GOOD TO KNOW */}
            <View style={styles.section}>
              <EventGoodToKnow
                items={form.goodToKnow}
                isEditing={isEditing}
                onChange={(val) => updateField("goodToKnow", val)}
              />
            </View>

            {/* CONTACT */}
            <View style={styles.section}>
              <EventContact
                contact={form.contact}
                isEditing={isEditing}
                onChange={(val) => updateField("contact", val)}
              />
            </View>

            {/* INFO */}
            
            <View style={styles.section}>
              <EventInfo
                event={form}
                isEditing={isEditing}
                onChangeAddress={(val: string) =>
                  updateField("address", val)
                }
              />
            </View>
            
            {/* RELATED */}
            {related.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  You may also like
                </Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {related.map((e: any) => (
                    <MiniEventCard key={e._id} item={e} />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* SAVE */}
            {isEditing && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveText}>
                  {updateMutation.isPending
                    ? "Saving..."
                    : "Save changes"}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backButtonContainer: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },

  container: {
    flex: 1,
    backgroundColor: "#0B0F1A",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B0F1A",
  },

  saveButton: {
    backgroundColor: "#FF7A00",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 30,
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
  },

  attendText: {
    color: "#fff",
    fontWeight: "600",
  },

  attendButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  cardContainer: {
  backgroundColor: "#0F172A",
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: 18,
  marginTop: 0,
},

  section: {
    marginTop: 20,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});