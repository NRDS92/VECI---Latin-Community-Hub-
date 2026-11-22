import {
  View,
  Text,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";

import { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { germanyCities } from "../../src/shared/data/germanCities";
import * as ImagePicker from "expo-image-picker";
import { uploadEventImage } from "../../src/features/events/services/uploadEventImage.service";
import { useAuth } from "../../src/shared/context/AuthContext";
import { useCreateEvent } from "../../src/features/events/hooks/useCreateEvent";
import { router } from "expo-router";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import type { AvailableEventOrganizer } from "@ndrs92/contracts";
import { getAvailableEventOrganizers } from "../../src/features/events/api/events.api";

type EventType = "official" | "community";
type EventCategory = "party" | "food" | "culture" | "sports";

export default function CreateEventScreen() {
  const { token, setShowLoginModal } = useAuth();

  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory>("party");
  const [eventType, setEventType] = useState<EventType>("community");

  const [address, setAddress] = useState("");
  const [dateStart, setDateStart] = useState<Date | null>(null);

  const [selectedCity, setSelectedCity] = useState(germanyCities[0]);

  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [goodToKnow, setGoodToKnow] = useState<string[]>([]);
  const [goodToKnowInput, setGoodToKnowInput] = useState("");

  const [organizers, setOrganizers] = useState<AvailableEventOrganizer[]>([]);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState("");
  const [loadingOrganizers, setLoadingOrganizers] = useState(false);

  const { mutate, isPending } = useCreateEvent();

  // 🔐 LOGIN (FIXED)
  useEffect(() => {
    if (!token) {
      setShowLoginModal(true);
    }
  }, [token]);

  // The server returns only active, approved organizers the current user may manage.
  useEffect(() => {
    if (!token) return;
    let current = true;
    setLoadingOrganizers(true);
    getAvailableEventOrganizers()
      .then((data: AvailableEventOrganizer[]) => { if (current) setOrganizers(data); })
      .catch((error: unknown) => {
        if (current) {
          const message = error instanceof Error ? error.message : "Unable to load event organizers";
          console.log("EVENT ORGANIZER ERROR:", message);
          Alert.alert("Error", "Failed to load eligible event organizers");
        }
      })
      .finally(() => { if (current) setLoadingOrganizers(false); });
    return () => { current = false; };
  }, [token]);

  const organizerType = eventType === "official" ? "business" : "community";
  const eligibleOrganizers = organizers.filter((organizer) => organizer.type === organizerType);

  const pickImage = async (): Promise<string | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (result.canceled) return null;
    return result.assets[0].uri;
  };

  const handleAddImage = async () => {
    try {
      const uri = await pickImage();
      if (!uri) return;
      setIsUploading(true);
      let uploadedUrl;

      try {
        uploadedUrl = await uploadEventImage(uri);
      } catch (err) {
        // 🔥 retry automático (Render cold start)
        await new Promise((r) => setTimeout(r, 2000));
        uploadedUrl = await uploadEventImage(uri);
      }

      setImage(uploadedUrl);

    } catch (err) {
      Alert.alert("Error", "Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      value: dateStart || new Date(),
      mode: "date",
      onChange: (_, selectedDate) => {
        if (selectedDate) setDateStart(selectedDate);
      },
    });
  };

  const handleAddGoodToKnow = () => {
    if (!goodToKnowInput.trim()) return;
    setGoodToKnow((prev) => [...prev, goodToKnowInput.trim()]);
    setGoodToKnowInput("");
  };

  const handleCreate = () => {
    if (!title || !description || !address) {
      Alert.alert("Missing info", "Fill all required fields");
      return;
    }

    if (!dateStart || dateStart < new Date()) {
      Alert.alert("Invalid date", "Select a future date");
      return;
    }

    if (!selectedOrganizerId || !eligibleOrganizers.some(({ id }) => id === selectedOrganizerId)) {
      Alert.alert("Missing organizer", `Select an approved ${organizerType} you manage`);
      return;
    }
    if (!image) {
      Alert.alert("Missing image", "Please add an image");
      return;
    }
    console.log("PAYLOAD:", {
      title,
      description,
      goodToKnow,
    });

    mutate(
      {
        title,
        description,
        category,
        eventType,
        organizer: { type: organizerType, id: selectedOrganizerId },
        images: image ? [image] : [],
        cityId: selectedCity.name,
        address,
        latitude: selectedCity.lat,
        longitude: selectedCity.lng,
        dateStart: dateStart.toISOString(),
        contact: { website, instagram, whatsapp },
        goodToKnow,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Evento creado");
          resetForm();
          router.back();
        },
      }
    );
  };

  const isOfficial = eventType === "official";
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("party");
    setEventType("community");
    setAddress("");
    setDateStart(null);
    setSelectedCity(germanyCities[0]);

    setWebsite("");
    setInstagram("");
    setWhatsapp("");

    setGoodToKnow([]);
    setGoodToKnowInput("");

    setImage(null);
    setSelectedOrganizerId("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create Event</Text>

        <TouchableOpacity onPress={handleAddImage}>
          <View style={styles.imageBox}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <Text style={styles.imagePlaceholder}>Add cover image</Text>
            )}

            {isUploading && (
              <View style={styles.overlay}>
                <ActivityIndicator color="#fff" />
                <Text style={{ color: "#fff", marginTop: 6 }}>Uploading...</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {renderInput("Title", title, setTitle)}
        {renderInput("Description", description, setDescription, true)}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Good to know</Text>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              value={goodToKnowInput}
              onChangeText={setGoodToKnowInput}
              style={[styles.input, { flex: 1 }]}
              placeholder="Add tip"
              placeholderTextColor="#6b7280"
            />

            <TouchableOpacity onPress={handleAddGoodToKnow}>
              <Text style={{ color: "#FF7A00" }}>Add</Text>
            </TouchableOpacity>
          </View>

          {goodToKnow.map((item, i) => (
            <Text key={i} style={{ color: "#fff", marginTop: 6 }}>
              • {item}
            </Text>
          ))}
        </View>

        {renderPicker("Category", category, (value) => setCategory(value as EventCategory), [
          { label: "Party", value: "party" },
          { label: "Food", value: "food" },
          { label: "Culture", value: "culture" },
          { label: "Sports", value: "sports" },
        ])}

        {renderPicker("Event Type", eventType, (value) => {
          setEventType(value as EventType);
          setSelectedOrganizerId("");
        }, [
          { label: "Community Event", value: "community" },
          { label: "Official Event", value: "official" },
        ])}

        <View style={styles.inputBox}>
          <Text style={styles.label}>{isOfficial ? "Business organizer" : "Community organizer"}</Text>

          {loadingOrganizers ? (
            <ActivityIndicator color="#fff" />
          ) : eligibleOrganizers.length === 0 ? (
            <Text style={styles.helperText}>
              {`You need an approved ${organizerType} that you manage to create this event.`}
            </Text>
          ) : (
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedOrganizerId}
                onValueChange={(val) => setSelectedOrganizerId(String(val))}
                style={styles.picker}
              >
                <Picker.Item label={`Select ${organizerType}`} value="" />
                {eligibleOrganizers.map((organizer) => (
                  <Picker.Item key={organizer.id} label={organizer.name} value={organizer.id} />
                ))}
              </Picker>
            </View>
          )}
        </View>

        {renderPicker(
          "City",
          selectedCity.name,
          (value: string) =>
            setSelectedCity(germanyCities.find((c) => c.name === value)!),
          germanyCities.map((c) => ({
            label: c.name,
            value: c.name,
          }))
        )}

        <TouchableOpacity style={styles.inputBox} onPress={openDatePicker}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.input}>
            {dateStart ? dateStart.toLocaleString() : "Select date"}
          </Text>
        </TouchableOpacity>

        {renderInput("Address", address, setAddress)}
        {renderInput("Website", website, setWebsite)}
        {renderInput("Instagram", instagram, setInstagram)}
        {renderInput("WhatsApp", whatsapp, setWhatsapp)}

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreate}
          disabled={isPending}
        >
          <Text style={styles.buttonText}>
            {isPending ? "Creating..." : "Create Event"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* HELPERS */

const renderInput = (label: string, value: string, onChange: (value: string) => void, multiline = false) => (
  <View style={styles.inputBox}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      style={[styles.input, multiline && { height: 70 }]}
      multiline={multiline}
    />
  </View>
);

const renderPicker = (label: string, value: string, onChange: (value: string) => void, options: { label: string; value: string }[]) => (
  <View style={styles.inputBox}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.pickerWrapper}>
      <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
        {options.map((o) => (
          <Picker.Item key={o.value} label={o.label} value={o.value} />
        ))}
      </Picker>
    </View>
  </View>
);

/* STYLES */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F1A" },
  content: { padding: 16, paddingBottom: 120 },

  title: { color: "#fff", fontSize: 24, fontWeight: "800", marginBottom: 16 },

  imageBox: {
    height: 80,
    borderRadius: 16,
    backgroundColor: "#121826",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  image: { width: "100%", height: "100%" },
  imagePlaceholder: { color: "#6b7280" },

  inputBox: {
    backgroundColor: "#121826",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },

  label: { color: "#9ca3af", fontSize: 12, marginBottom: 4 },
  input: { color: "#fff" },

  pickerWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1A2233",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  picker: { color: "#fff", height: 50 },

  button: {
    backgroundColor: "#FF7A00",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: { color: "#fff", fontWeight: "600" },

  helperText: {
    color: "#9ca3af",
    marginBottom: 10,
  },

  createBusinessButton: {
    backgroundColor: "#FF7A00",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  createBusinessText: {
    color: "#fff",
    fontWeight: "600",
  },
});
