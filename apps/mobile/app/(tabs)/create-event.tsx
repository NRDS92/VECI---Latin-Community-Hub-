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

import { getMyBusinesses } from "../../src/features/user/service/upload.service";

export default function CreateEventScreen() {
  const { token, setShowLoginModal } = useAuth();

  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("party");
  const [eventType, setEventType] = useState("community");

  const [address, setAddress] = useState("");
  const [dateStart, setDateStart] = useState<Date | null>(null);

  const [selectedCity, setSelectedCity] = useState(germanyCities[0]);

  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [goodToKnow, setGoodToKnow] = useState<string[]>([]);
  const [goodToKnowInput, setGoodToKnowInput] = useState("");

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);

  const { mutate, isPending } = useCreateEvent();

  // 🔐 LOGIN (FIXED)
  useEffect(() => {
    if (!token) {
      setShowLoginModal(true);
    }
  }, [token]);

  // 🔥 FETCH BUSINESSES
  useEffect(() => {
    if (eventType === "official" && token) {
      fetchMyBusinesses();
    }
  }, [eventType]);

  const fetchMyBusinesses = async () => {
    try {
      setLoadingBusinesses(true);

      const data = await getMyBusinesses();

      setBusinesses(data || []);
    } catch (error: any) {
      console.log("BUSINESS ERROR:", error?.response?.data || error.message);

      Alert.alert("Error", "Failed to load your businesses");
    } finally {
      setLoadingBusinesses(false);
    }
  };

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
      if (!uri || !token) return;

      setIsUploading(true);

      let uploadedUrl;

      try {
        uploadedUrl = await uploadEventImage(uri, token);
      } catch (err) {
        // 🔥 retry automático (Render cold start)
        await new Promise((r) => setTimeout(r, 2000));
        uploadedUrl = await uploadEventImage(uri, token);
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

    if (eventType === "official" && !selectedBusinessId) {
      Alert.alert("Missing business", "Please select a business");
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
        businessId:
          eventType === "official" ? selectedBusinessId : undefined,
        images: image ? [image] : [],
        cityId: selectedCity.name,
        address,
        latitude: selectedCity.lat,
        longitude: selectedCity.lng,
        dateStart,
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
    setSelectedBusinessId("");
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

        {renderPicker("Category", category, setCategory, [
          { label: "Party", value: "party" },
          { label: "Food", value: "food" },
          { label: "Culture", value: "culture" },
          { label: "Sports", value: "sports" },
        ])}

        {renderPicker("Event Type", eventType, setEventType, [
          { label: "Community Event", value: "community" },
          { label: "Official Event", value: "official" },
        ])}

        {/* 🔥 BUSINESS SELECTOR */}
        {isOfficial && (
          <View style={styles.inputBox}>
            <Text style={styles.label}>Business</Text>

            {loadingBusinesses ? (
              <ActivityIndicator color="#fff" />
            ) : businesses.length === 0 ? (
              <>
                <Text style={styles.helperText}>
                  You don’t have any business yet
                </Text>

                <TouchableOpacity
                  style={styles.createBusinessButton}
                  onPress={() =>
                    router.push("/business/CreateBusinessScreen")
                  }
                >
                  <Text style={styles.createBusinessText}>
                    Create your business
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedBusinessId}
                  onValueChange={(val) => setSelectedBusinessId(val)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select business" value="" />
                  {businesses.map((b) => (
                    <Picker.Item key={b._id} label={b.name} value={b._id} />
                  ))}
                </Picker>
              </View>
            )}
          </View>
        )}

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

const renderInput = (label: string, value: string, onChange: any, multiline = false) => (
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

const renderPicker = (label: string, value: string, onChange: any, options: any[]) => (
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