import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
} from "react-native";

import MyBusinessCard from "../../src/features/business/components/MyBusinnessCard";

import {
    useMyBusinesses,
    useDeleteBusiness,
} from "../../src/features/business/hooks/useCreateBusiness";

export default function MyBusinessesScreen() {
    const { data, isLoading, isError } = useMyBusinesses();
    const deleteMutation = useDeleteBusiness();

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete business",
            "Are you sure you want to delete this business?",
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
                <Text style={styles.text}>Loading...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.center}>
                <Text style={[styles.text, { color: "red" }]}>
                    Error loading businesses
                </Text>
            </View>
        );
    }

    if (!data || data.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>
                    You don’t have any businesses yet
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            style={styles.container}
            data={data}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => (
                 <MyBusinessCard item={item} onDelete={handleDelete} />
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0F1A",
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0B0F1A",
    },

    text: {
        color: "#fff",
    },

    card: {
        backgroundColor: "#121826",
        marginHorizontal: 12,
        marginTop: 12,
        padding: 12,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
    },

    image: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 12,
    },

    info: {
        flex: 1,
    },

    title: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },

    category: {
        color: "#9ca3af",
        fontSize: 12,
        marginTop: 4,
    },

    actions: {
        flexDirection: "row",
        gap: 16,
    },

    createEventButton: {
        marginTop: 10,
        backgroundColor: "#FF7A00",
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: "center",
    },

    createEventText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 13,
    },
});