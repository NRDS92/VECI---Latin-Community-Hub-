import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
};

export default function DatePickerModal({
    visible,
    onClose,
    onSelect,
}: Props) {
    const [date, setDate] = useState(new Date());

    return (
        <Modal visible={visible} transparent>
        <View style={{ flex: 1, justifyContent: "center", backgroundColor: "#000000aa" }}>
            <View style={{ backgroundColor: "#121826", margin: 20, borderRadius: 12, padding: 20 }}>
            
            <Text style={{ color: "#fff", marginBottom: 10 }}>
                Select Date
            </Text>

            <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(e, selected) => {
                if (selected) setDate(selected);
                }}
            />

            <TouchableOpacity
                onPress={() => {
                onSelect(date.toISOString());
                onClose();
                }}
            >
                <Text style={{ color: "#FF7A00", marginTop: 20 }}>
                Confirm
                </Text>
            </TouchableOpacity>

            </View>
        </View>
        </Modal>
    );
}