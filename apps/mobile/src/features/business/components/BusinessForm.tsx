import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import LocationPicker from "../../../components/LocationPicker";
import { MaterialIcons } from "@expo/vector-icons";

/* ================= TYPES ================= */

export type BusinessFormValues = {
  name: string;
  description: string;
  category: string;
  subCategory: string;
  priceRange: "$" | "$$" | "$$$" | undefined;
  phone: string;
  instagram: string;
  image: string;
  menu: string;
  address: string;
  cityId: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

type Props = {
  values: BusinessFormValues;
  onChange: <K extends keyof BusinessFormValues>(
    field: K,
    value: BusinessFormValues[K]
  ) => void;
  onPickImage: () => void;
  onPickMenu: () => void;
  categoryMap: Record<string, string[]>;
  onOpenCityModal: () => void;
};

/* ================= COMPONENT ================= */
const Section = ({ title, children }: any) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const PickerField = ({ label, value, onChange, items }: any) => (
  <View style={styles.inputBox}>
    <Text style={styles.label}>{label}</Text>
    <Picker
      selectedValue={value}
      onValueChange={onChange}
      style={styles.picker}
    >
      <Picker.Item label={`Select ${label.toLowerCase()}`} value="" />
      {items.map((item: string) => (
        <Picker.Item key={item} label={item} value={item} />
      ))}
    </Picker>
  </View>
);

/* ================= COMPONENT ================= */

export default function BusinessForm({
  values,
  onChange,
  onPickImage,
  onPickMenu,
  categoryMap,
  onOpenCityModal,
}: Props) {
  const isFood = values.category === "food";

  return (
    <>
      {/* ================= COVER ================= */}
      <Section title="Cover">
        <TouchableOpacity onPress={onPickImage} style={styles.imageBox}>
          {values.image ? (
            <Image source={{ uri: values.image }} style={styles.image} />
          ) : (
            <Text style={styles.placeholder}>Upload cover image</Text>
          )}
        </TouchableOpacity>
      </Section>

      {/* ================= BASIC INFO ================= */}
      <Section title="Basic Info">
        <Input
          label="Name"
          value={values.name}
          onChange={(v) => onChange("name", v)}
        />

        <Input
          label="Description"
          value={values.description}
          onChange={(v) => onChange("description", v)}
          multiline
        />
      </Section>

      {/* ================= CATEGORY ================= */}
      <Section title="Category">
        <PickerField
          label="Category"
          value={values.category}
          onChange={(v: string) => {
            onChange("category", v);
            onChange("subCategory", "");
          }}
          items={Object.keys(categoryMap)}
        />

        {values.category && (
          <PickerField
            label="Subcategory"
            value={values.subCategory}
            onChange={(v: string) => onChange("subCategory", v)}
            items={categoryMap[values.category]}
          />
        )}

        {isFood && (
          <>
            <PickerField
              label="Price"
              value={values.priceRange}
              onChange={(v: "$" | "$$" | "$$$") =>
                onChange("priceRange", v)
              }
              items={["$", "$$", "$$$"]}
            />

            <TouchableOpacity style={styles.inputBox} onPress={onPickMenu}>
              <Text style={{ color: values.menu ? "#fff" : "#6b7280" }}>
                {values.menu ? "Menu uploaded ✓" : "Upload menu (PDF)"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Section>

      {/* ================= LOCATION ================= */}
      <Section title="Location">
        <Input
          label="Address"
          value={values.address}
          onChange={(v) => onChange("address", v)}
        />

        <TouchableOpacity
          style={styles.inputBox}
          onPress={onOpenCityModal}
        >
          <Text style={styles.label}>City</Text>

          <View style={styles.rowBetween}>
            <Text style={{ color: values.cityId ? "#fff" : "#6b7280" }}>
              {values.cityId || "Select city"}
            </Text>

            <MaterialIcons name="keyboard-arrow-right" size={20} color="#6b7280" />
          </View>
        </TouchableOpacity>

        <LocationPicker
          onSelect={(coords: { latitude: number; longitude: number }) =>
            onChange("coordinates", coords)
          }
        />
      </Section>

      {/* ================= CONTACT ================= */}
      <Section title="Contact">
        <Input
          label="Phone"
          value={values.phone}
          onChange={(v) => onChange("phone", v)}
        />

        <Input
          label="Instagram"
          value={values.instagram}
          onChange={(v) => onChange("instagram", v)}
        />
      </Section>
      
    </>
  );
}


/* ================= INPUT ================= */

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
};

const Input = ({
  label,
  value,
  onChange,
  multiline = false,
}: InputProps) => (
  <View style={styles.inputBox}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      style={[styles.input, multiline && { height: 80 }]}
      multiline={multiline}
    />
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  section: { color: "#9ca3af", marginBottom: 10, marginTop: 10 },

  inputBox: {
    backgroundColor: "#121826",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },

  label: { color: "#9ca3af", fontSize: 12, marginBottom: 6 },

  input: { color: "#fff" },

  picker: { color: "#fff" },

  imageBox: {
    height: 160,
    backgroundColor: "#121826",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },

  image: { width: "100%", height: "100%" },

  placeholder: { color: "#6b7280" },
    rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});