import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";

type Props = {
  items?: string[];
  isEditing?: boolean;
  onChange?: (items: string[]) => void;
};

export default function EventGoodToKnow({
  items = [],
  isEditing = false,
  onChange,
}: Props) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (!input.trim()) return;

    const updated = [...items, input.trim()];
    onChange?.(updated);
    setInput("");
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange?.(updated);
  };

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ color: "#fff", fontWeight: "600" }}>
        Good to know
      </Text>

      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => isEditing && handleRemove(index)}
        >
          <Text style={{ color: "#9ca3af" }}>
            • {item} {isEditing && "(remove)"}
          </Text>
        </TouchableOpacity>
      ))}

      {isEditing && (
        <>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Add tip..."
            placeholderTextColor="#6b7280"
            style={{ color: "#fff", marginTop: 8 }}
          />

          <TouchableOpacity onPress={handleAdd}>
            <Text style={{ color: "#FF7A00" }}>+ Add</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}