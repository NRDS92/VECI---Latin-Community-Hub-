import { View, Text, StyleSheet, TextInput } from "react-native";
import EventMap from "./EventMap";
import { MaterialIcons } from "@expo/vector-icons";

export default function EventInfo({
        event,
        isEditing,
        onChangeAddress,
    }: any) {
    const address = event?.address || "";
    const location = event?.location;

    const hasValidLocation =
        location &&
        (Array.isArray(location.coordinates)
        ? location.coordinates.length === 2
        : location.coordinates?.lat && location.coordinates?.lng);

    return (
        <View style={styles.container}>
        {/* ADDRESS */}
        {isEditing ? (
            <TextInput
            value={address}
            onChangeText={onChangeAddress}
            style={styles.input}
            placeholder="Address"
            placeholderTextColor="#666"
            />
        ) : (
            <View style={styles.addressRow}>
            <MaterialIcons name="location-on" size={16} color="#9ca3af" />
            <Text style={styles.meta}>{address || "No address"}</Text>
            </View>
        )}

        {/* 🔥 SAFE MAP RENDER */}
        {hasValidLocation && <EventMap location={location} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 10, },

    meta: { color: "#9ca3af",  },

    input: {
        backgroundColor: "#121826",
        color: "#fff",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingBottom: 15,
    },
    

    
});