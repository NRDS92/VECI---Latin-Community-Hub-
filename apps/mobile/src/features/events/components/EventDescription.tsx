import { View, Text, StyleSheet, TextInput } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";


const CATEGORIES = [
    { label: "Party", value: "party" },
    { label: "Food", value: "food" },
    { label: "Culture", value: "culture" },
    { label: "Sports", value: "sports" },
    { label: "Meetup", value: "meetup" },
    { label: "Concert", value: "concert" },
];

export default function EventDescription({
    description,
    isEditing,
    onChangeDescription,
    onChangeCategories,
    event
}: any) {
    return (
        <View style={styles.container}>
            {/* MULTI SELECT CATEGORY */}
            {isEditing ? (
                <MultiSelect
                    style={styles.dropdown}
                    data={CATEGORIES}
                    labelField="label"
                    valueField="value"
                    value={event.categories || []}
                    placeholder="Select categories"
                    placeholderStyle={{ color: "#9ca3af" }}
                    selectedTextStyle={{ color: "#fff" }}
                    itemTextStyle={{ color: "#fff" }}
                    containerStyle={{ backgroundColor: "#121826" }}
                    onChange={(items: string[]) => {
                        onChangeCategories(items);
                    }}
                />
            ) : (
                <View style={styles.badgeContainer}>
                    {(event.categories || []).map((cat: string) => (
                        <View key={cat} style={styles.badge}>
                            <Text style={styles.badgeText}>{cat}</Text>
                        </View>
                    ))}
                </View>
            )}
            <Text style={styles.label}>Description</Text>

            {isEditing ? (
                <TextInput
                    value={description}
                    onChangeText={onChangeDescription}
                    multiline
                    style={styles.input}
                />
            ) : (
                <Text style={styles.text}>{description}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 16 },

    label: {
        color: "#9ca3af",
        marginBottom: 6,
    },

    text: {
        color: "#fff",
    },
    dropdown: {
        backgroundColor: "#121826",
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
    },
    badgeContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10,
    },

    badge: {
        backgroundColor: "rgba(255,122,0,0.2)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },

    badgeText: {
        color: "#FF7A00",
        fontSize: 12,
        fontWeight: "600",
    },

    input: {
        backgroundColor: "#121826",
        color: "#fff",
        padding: 12,
        borderRadius: 10,
    },
});