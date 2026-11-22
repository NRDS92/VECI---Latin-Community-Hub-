import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import {
  useBusiness,
  useCreateBusiness,
  useUpdateBusiness,
} from "../../src/features/business/hooks/useCreateBusiness";

import BusinessForm from "../../src/features/business/components/BusinessForm";
import { uploadImage } from "../../src/shared/services/uploadService";
import { useAuth } from "../../src/shared/context/AuthContext";
import CitySelectorModal from "../../src/features/discover/components/CitySelectorModal";
import {
  buildCreateBusinessRequest,
  buildUpdateBusinessRequest,
} from "../../src/features/business/business-form.helpers";
import type { BusinessFormValues } from "../../src/features/business/business-form.types";


const CATEGORY_MAP = {
  food: ["restaurant", "cafe", "bar", "bakery"],
  entertainment: ["club", "event_venue"],
  services: ["agency", "repair"],
  shopping: ["latin_store", "supermarket"],
  education: ["academy"],
  health: ["gym", "clinic"],
};

export default function CreateBusinessScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const isEdit = Boolean(id);

  const businessQuery = useBusiness(id);
  const data = businessQuery.data;
  const createMutation = useCreateBusiness();
  const updateMutation = useUpdateBusiness();
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [hydratedBusinessId, setHydratedBusinessId] = useState<string>();

  const { token } = useAuth();

  const [form, setForm] = useState<BusinessFormValues>({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    priceRange: undefined,
    phone: "",
    instagram: "",
    image: "",
    menu: "",
    address: "",
    cityId: "",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
  });

  // ✅ SYNC DATA (EDIT MODE)
  useEffect(() => {
    if (data && isEdit) {
      setForm({
        name: data.name || "",
        description: data.description || "",
        category: data.category || "",
        subCategory: data.subCategory || "",
        priceRange: data.priceRange,
        phone: data.contact?.phone || "",
        instagram: data.contact?.instagram || "",
        image: data.images?.profile || "",
        menu: data.documents.find((document) => document.type === "menu")?.url || data.menu || "",
        address: data.location?.address || "",
        cityId: data.location?.cityId || "",
        coordinates: {
          latitude: data.location.coordinates?.lat ?? 0,
          longitude: data.location.coordinates?.lng ?? 0,
        },
      });
      setHydratedBusinessId(data._id);
    }
  }, [data, isEdit]);

  const handleChange = <K extends keyof BusinessFormValues>(field: K, value: BusinessFormValues[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 📸 IMAGE
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      handleChange("image", result.assets[0].uri);
    }
  };

  // 📄 MENU
  const handlePickMenu = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });

    if (!result.canceled) {
      handleChange("menu", result.assets[0].uri);
    }
  };

  // 🚀 SUBMIT (CREATE + UPDATE)
  const handleSubmit = async () => {
    try {
      if (!token) {
        Alert.alert("Error", "Not authenticated");
        return;
      }

      if (isEdit && (!data || hydratedBusinessId !== data._id)) {
        Alert.alert("Error", "Business details are not available yet.");
        return;
      }

      const currentBusiness = data;
      if (isEdit && (!currentBusiness?.location.country || !currentBusiness.location.coordinates)) {
        Alert.alert("Unable to update", "This business is missing required location data. No changes were saved.");
        return;
      }

      let imageUrl = form.image;
      let menuUrl = form.menu;

      // upload only if local
      if (form.image?.startsWith("file")) {
        imageUrl = await uploadImage(form.image, token);
      }

      if (form.menu?.startsWith("file")) {
        menuUrl = await uploadImage(form.menu, token);
      }

      if (isEdit) {
        if (!currentBusiness || !id) return;
        await updateMutation.mutateAsync({
          id,
          data: buildUpdateBusinessRequest({ ...form, image: imageUrl, menu: menuUrl }, currentBusiness),
        });
      } else {
        await createMutation.mutateAsync(buildCreateBusinessRequest({ ...form, image: imageUrl, menu: menuUrl }));
      }

      Alert.alert("Success", isEdit ? "Updated" : "Created");
      router.back();
    } catch (error) {
      console.log("ERROR:", error);
      Alert.alert("Error", "Something failed");
    }
  };

  return (
  <View style={styles.wrapper}>
    
    {/* 🔥 SCROLL */}
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <Text style={styles.title}>
        {isEdit ? "Edit Business" : "Create Business"}
      </Text>

      {isEdit && businessQuery.isLoading ? (
        <Text style={styles.title}>Loading business…</Text>
      ) : isEdit && businessQuery.isError ? (
        <Text style={styles.errorText}>
          {getBusinessLoadErrorMessage(businessQuery.error)}
        </Text>
      ) : isEdit && !data ? (
        <Text style={styles.errorText}>Business not found.</Text>
      ) : isEdit && hydratedBusinessId !== data?._id ? (
        <Text style={styles.title}>Loading business…</Text>
      ) : <BusinessForm
        values={form}
        onChange={handleChange}
        onPickImage={handlePickImage}
        onPickMenu={handlePickMenu}
        categoryMap={CATEGORY_MAP}
        onOpenCityModal={() => setCityModalVisible(true)}
      />}
    </ScrollView>

    {/* 🔥 BOTÓN FIJO */}
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={createMutation.isPending || updateMutation.isPending || (isEdit && (!data || hydratedBusinessId !== data._id || businessQuery.isLoading || businessQuery.isError))}
      >
        <Text style={styles.buttonText}>
          {isEdit ? "Update Business" : "Create Business"}
        </Text>
      </TouchableOpacity>
    </View>

    {/* 🔥 MODAL (fuera del scroll) */}
    <CitySelectorModal
      visible={cityModalVisible}
      onClose={() => setCityModalVisible(false)}
      onSelect={(city) => {
        handleChange("cityId", city.name);
        handleChange("coordinates", {
          latitude: city.lat,
          longitude: city.lng,
        });
        setCityModalVisible(false);
      }}
    />
  </View>
);
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#0B0F1A",
  },

  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0B0F1A",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#1f2937",
  },

  button: {
    backgroundColor: "#FF7A00",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: { color: "#f87171", marginVertical: 12 },
});

function getBusinessLoadErrorMessage(error: unknown): string {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 401) return "Please sign in again to edit this business.";
  if (status === 403) return "You do not have permission to edit this business.";
  if (status === 404) return "Business not found.";
  return "Could not load this business. Please try again.";
}
