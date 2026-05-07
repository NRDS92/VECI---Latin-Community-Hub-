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


const CATEGORY_MAP = {
  food: ["restaurant", "cafe", "bar", "bakery"],
  entertainment: ["club", "event_venue"],
  services: ["agency", "repair"],
  shopping: ["latin_store", "supermarket"],
  education: ["academy"],
  health: ["gym", "clinic"],
};

export default function CreateBusinessScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const { data } = useBusiness(id);
  const createMutation = useCreateBusiness();
  const updateMutation = useUpdateBusiness();
  const [cityModalVisible, setCityModalVisible] = useState(false);

  const { token } = useAuth();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    priceRange:  undefined as "$" | "$$" | "$$$" | undefined,
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
        priceRange: data.priceRange || null,
        phone: data.contact?.phone || "",
        instagram: data.contact?.instagram || "",
        image: data.images?.profile || "",
        menu: data.menu || "",
        address: data.location?.address || "",
        cityId: data.location?.cityId || "",
        coordinates: {
          latitude: data.location?.coordinates?.lat || 0,
          longitude: data.location?.coordinates?.lng || 0,
        },
      });
    }
  }, [data, isEdit]);

  const handleChange = (field: string, value: any) => {
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

      let imageUrl = form.image;
      let menuUrl = form.menu;

      // upload only if local
      if (form.image?.startsWith("file")) {
        imageUrl = await uploadImage(form.image, token);
      }

      if (form.menu?.startsWith("file")) {
        menuUrl = await uploadImage(form.menu, token);
      }

      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        subCategory: form.subCategory,
        priceRange: form.priceRange,
        menu: menuUrl,
        images: { profile: imageUrl },
        location: {
          address: form.address,
          cityId: form.cityId,
          country: "Germany",
          coordinates: {
            lat: form.coordinates.latitude,
            lng: form.coordinates.longitude,
          },
        },
        contact: {
          phone: form.phone,
          instagram: form.instagram,
        },
        tags: [],
        languages: ["es"],
        isLatinoOwned: true,
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
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

      <BusinessForm
        values={form}
        onChange={handleChange}
        onPickImage={handlePickImage}
        onPickMenu={handlePickMenu}
        categoryMap={CATEGORY_MAP}
        onOpenCityModal={() => setCityModalVisible(true)}
      />
    </ScrollView>

    {/* 🔥 BOTÓN FIJO */}
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={createMutation.isPending || updateMutation.isPending}
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
});