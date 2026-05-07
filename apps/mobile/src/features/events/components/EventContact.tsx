import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Platform,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";

type Props = {
  contact?: {
    website?: string;
    instagram?: string;
    whatsapp?: string;
  };
  isEditing?: boolean;
  onChange?: (val: any) => void;
};

export default function EventContact({
  contact = {},
  isEditing,
  onChange,
}: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (
    !isEditing &&
    !contact.website &&
    !contact.instagram &&
    !contact.whatsapp
  ) {
    return null;
  }

  const update = (key: string, value: string) => {
    onChange?.({
      ...contact,
      [key]: value,
    });
  };

  const handleCopy = async (value: string, key: string) => {
    await Clipboard.setStringAsync(value);

    setCopiedField(key);

    // feedback visual + fallback toast
    if (Platform.OS === "android") {
      ToastAndroid.show("Copied", ToastAndroid.SHORT);
    } else {
      // evita spam de alerts → solo visual ya funciona
    }

    setTimeout(() => {
      setCopiedField(null);
    }, 1500);
  };

  const renderRow = (
    icon: keyof typeof MaterialIcons.glyphMap,
    value: string,
    key: string
  ) => (
    <View style={styles.rowBetween}>
      <View style={styles.row}>
        <MaterialIcons name={icon} size={16} color="#9ca3af" />
        <Text style={styles.text}>{value}</Text>
      </View>

      <TouchableOpacity onPress={() => handleCopy(value, key)}>
        <MaterialIcons
          name={copiedField === key ? "check" : "content-copy"}
          size={16}
          color={copiedField === key ? "#22c55e" : "#9ca3af"}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact</Text>

      {isEditing ? (
        <>
          <TextInput
            value={contact.website}
            onChangeText={(val) => update("website", val)}
            placeholder="Website"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />

          <TextInput
            value={contact.instagram}
            onChangeText={(val) => update("instagram", val)}
            placeholder="Instagram"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />

          <TextInput
            value={contact.whatsapp}
            onChangeText={(val) => update("whatsapp", val)}
            placeholder="WhatsApp"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
        </>
      ) : (
        <View style={{ marginTop: 10 }}>
          {contact.website && renderRow("language", contact.website, "website")}
          {contact.instagram &&
            renderRow("photo-camera", contact.instagram, "instagram")}
          {contact.whatsapp &&
            renderRow("chat", contact.whatsapp, "whatsapp")}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },

  title: {
    color: "#fff",
    fontWeight: "600",
  },

  input: {
    color: "#fff",
    marginTop: 8,
    borderBottomWidth: 1,
    borderColor: "#2A3348",
    paddingVertical: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  text: {
    color: "#9ca3af",
    marginLeft: 6,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
});