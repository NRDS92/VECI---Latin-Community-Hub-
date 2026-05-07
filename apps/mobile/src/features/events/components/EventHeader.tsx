import {
    ImageBackground,
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import EventDateCard from "./EventDateCard";

export default function EventHeader({
    image,
    title,
    date,
    topInset,
    isEditing,
    onChangeTitle,
    onChangeImage,
}: any) {
    const pickImage = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            onChangeImage(uri);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                activeOpacity={isEditing ? 0.8 : 1}
                onPress={isEditing ? pickImage : undefined}
                style={{ flex: 1 }}
            >
                <ImageBackground
                    source={
                        typeof image === "string" && image
                            ? { uri: image }
                            : require("../../../../assets/splash.png") 
                    }
                    style={styles.image}
                >
                    <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.9)"]}
                        style={styles.gradient}
                    />
                    {date && (
                        <View style={[styles.dateFloating, { top: (topInset ?? 0) + 10 }]}>
                            <EventDateCard date={date} />
                        </View>
                    )}

                    {/* 🖼️ EDIT ICON */}
                    {isEditing && (
                        <View style={styles.editIcon}>
                            <MaterialIcons
                                name="photo-camera"
                                size={20}
                                color="#fff"
                            />
                        </View>
                    )}

                    <View
                        style={[
                            styles.content,
                            {
                            paddingTop: (topInset ?? 0) + 20,
                            justifyContent: "flex-end",
                            },
                        ]}
                        >
                        {isEditing ? (
                            <TextInput
                                value={title}
                                onChangeText={onChangeTitle}
                                style={styles.input}
                            />
                        ) : (
                            <Text style={styles.title}>{title}</Text>
                        )}

                        
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { minHeight: 300, },

    image: { flex: 1, justifyContent: "flex-end" },

    gradient: { ...StyleSheet.absoluteFillObject },

    content: {
        paddingHorizontal: 16,
        paddingBottom: 60, 
        flex: 1,
        justifyContent: "flex-end",
    },

    title: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "700",
        lineHeight: 30,
        flexShrink: 1, 
    },

    date: {
        color: "#e5e7eb",
        marginTop: 6,
        fontSize: 13,
        opacity: 0.9,
    },
    dateFloating: {
        position: "absolute",
        right: 16,
        zIndex: 20,
    },

    input: {
        backgroundColor: "#121826",
        color: "#fff",
        padding: 8,
        borderRadius: 8,
    },

    editIcon: {
        position: "absolute",
        top: 50,
        right: 16,
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 8,
        borderRadius: 20,
    },
});