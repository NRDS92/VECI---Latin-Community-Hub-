import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MyEventCard from "../../src/features/events/components/MyEventCard";
import {
    useMyEvents,
    useDeleteEvent,
} from "../../src/features/events/hooks/useEvents";

export default function MyEventsScreen() {
    const { data, isLoading, isError } = useMyEvents();
    const deleteMutation = useDeleteEvent();
    const insets = useSafeAreaInsets();

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete event",
            "Are you sure you want to delete this event?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteMutation.mutate(id),
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <Text style={{ color: "#fff" }}>Loading...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.center}>
                <Text style={{ color: "red" }}>Error loading events</Text>
            </View>
        );
    }

    if (!data || data.length === 0) {
        return (
            <View style={styles.center}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={{ color: "#fff" }}>
                    You don’t have any events yet
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#0B0F1A" }}>
            
            {/* 🔙 HEADER */}
            <View
                style={[
                    styles.header,
                    { paddingTop: insets.top + 10 },
                ]}
            >
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>My Events</Text>

                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={data}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingTop: 10 }}
                renderItem={({ item }) => (
                    <MyEventCard item={item} onDelete={handleDelete} />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 12,
    },

    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0B0F1A",
    },

    card: {
        backgroundColor: "#121826",
        marginHorizontal: 12,
        marginVertical: 6,
        padding: 16,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    title: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        flex: 1,
    },

    actions: {
        flexDirection: "row",
        gap: 16,
    },
});