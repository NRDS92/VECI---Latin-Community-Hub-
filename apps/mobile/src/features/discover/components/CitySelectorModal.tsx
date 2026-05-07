import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from "react-native";

import { germanyCities } from "../../../shared/data/germanCities"; // ajusta path

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: {
    name: string;
    lat: number;
    lng: number;
  }) => void;
};

export default function CitySelectorModal({
  visible,
  onClose,
  onSelect, 
}: Props) {
  const [search, setSearch] = useState("");

  // 🔥 FILTER PRO (rápido + eficiente)
  const filteredCities = useMemo(() => {
    if (!search) return germanyCities;

    return germanyCities.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: "#0B0F1A", padding: 20 }}>
        
        {/* HEADER */}
        <Text style={{ color: "#fff", fontSize: 18, marginBottom: 12 }}>
          Select City
        </Text>

        {/* 🔍 SEARCH */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search city..."
          placeholderTextColor="#6b7280"
          style={{
            backgroundColor: "#121826",
            color: "#fff",
            padding: 12,
            borderRadius: 12,
            marginBottom: 16,
          }}
        />

        {/* LIST */}
        <FlatList
          data={filteredCities}
          keyExtractor={(item) => item.name}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onSelect(item);
                onClose();
              }}
              style={{
                paddingVertical: 14,
                borderBottomWidth: 0.5,
                borderBottomColor: "#1f2937",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* CLOSE */}
        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: "#FF7A00", marginTop: 20 }}>
            Close
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}