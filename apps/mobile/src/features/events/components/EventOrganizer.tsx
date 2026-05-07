import { View, Text, Image, StyleSheet } from "react-native";

type Organizer = {
    name?: string;
    profileImage?: string;
} | string;

const isOrganizerObject = (
    organizer: Organizer
): organizer is { name?: string; profileImage?: string } => {
    return typeof organizer === "object" && organizer !== null;
};

export default function EventOrganizer({
    organizer,
}: {
    organizer: Organizer;
}) {
    if (!organizer) return null;

    const isObject = isOrganizerObject(organizer);

    return (
        <View style={styles.container}>
            {isObject && organizer.profileImage ? (
                <Image
                    source={{ uri: organizer.profileImage }}
                    style={styles.avatar}
                />
            ) : (
                <View style={styles.avatarPlaceholder} />
            )}

            <View>
                <Text style={styles.label}>Organized by</Text>

                <Text style={styles.name}>
                    {isObject
                        ? organizer.name || "Unknown"
                        : "Organizer"}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },

    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 10,
    },

    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#1A2233",
        marginRight: 10,
    },

    label: {
        color: "#9ca3af",
        fontSize: 12,
    },

    name: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});