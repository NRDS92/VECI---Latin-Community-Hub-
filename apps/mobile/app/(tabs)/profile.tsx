import {
    View,
    Text,
    Image,
    Alert,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../src/shared/context/AuthContext";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { updateUser, deleteAccount } from "../../src/features/user/api/user.api";
import { uploadProfileImage } from "../../src/features/user/service/upload.service";
import CitySelectorModal from "../../src/features/discover/components/CitySelectorModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
    const { user, logout, setShowLoginModal, setUser, token } = useAuth();
    const insets = useSafeAreaInsets();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [cityId, setCityId] = useState("");
    const [bio, setBio] = useState("");
    const [profileImage, setProfileImage] = useState("");

    const [cityModalVisible, setCityModalVisible] = useState(false);

    useEffect(() => {
        if (!user) {
            setShowLoginModal(true);
    }
    }, [user]);
    



    const handleLogout = () => {
        Alert.alert("Cerrar sesión", "¿Seguro que quieres salir?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Salir",
                style: "destructive",
                onPress: async () => {
                    await logout();
                    router.replace("/");
                },
            },
        ]);
    };

    const handleSave = async () => {
        try {
            const payload: any = {};

            if (name !== user?.name) payload.name = name;
            if (cityId !== user?.cityId) payload.cityId = cityId;

            // 🔥 CLAVE: solo enviar bio si tiene contenido
            if (bio && bio.trim() !== user?.bio) {
            payload.bio = bio;
            }

            // 🔥 SOLO si cambió
            if (profileImage && profileImage !== user?.profileImage) {
            payload.profileImage = profileImage;
            }

            // 🚨 si no hay cambios, no hacer request
            if (Object.keys(payload).length === 0) {
            setIsEditing(false);
            return;
            }

            const updated = await updateUser(payload);

            console.log("🟢 UPDATED USER:", updated);

            setUser(updated);
            await AsyncStorage.setItem("user", JSON.stringify(updated));

            setIsEditing(false);

        } catch (error: any) {
            console.log("UPDATE ERROR FULL:", error?.response?.data);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setName(user?.name || "");
        setCityId(user?.cityId || "");
        setBio(user?.bio || "");
        setProfileImage(user?.profileImage || "");
    };

    const pickImage = async (): Promise<string | null> => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return null;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.7,
        });

        if (result.canceled) return null;

        return result.assets[0].uri;
    };

    const handleChangeImage = async () => {
        try {
            const uri = await pickImage();
            if (!uri || !token || !user) return;

            setProfileImage(uri);

            const res = await uploadProfileImage(uri, token);
            const newImage = res.profileImage;

            const updated = await updateUser({
            profileImage: newImage,
            });


            setUser(updated);
            setProfileImage(updated.profileImage);

            await AsyncStorage.setItem("user", JSON.stringify(updated));

        } catch (error) {
            console.log("IMAGE ERROR:", error);
        }
    };
    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete account",
            "This action is irreversible. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteAccount();

                            // 🔥 limpiar sesión
                            await logout();

                            // 🔥 redirigir
                            router.replace("/");

                        } catch (error: any) {
                            console.log("DELETE ERROR:", error?.response?.data);

                            Alert.alert(
                                "Error",
                                error?.response?.data?.message ||
                                    "Failed to delete account"
                            );
                        }
                    },
                },
            ]
        );
    };
    useEffect(() => {
        if (!user || isEditing) return;

        setName(user.name ?? "");
        setCityId(user.cityId ?? "");
        setBio(user.bio ?? "");
        setProfileImage(user.profileImage ?? "");

    }, [user, isEditing]);

    return (
        <View style={styles.wrapper}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 100,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.title}>Profile</Text>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setIsEditing(!isEditing)}
                    >
                        <MaterialIcons name="edit" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* AVATAR */}
                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={handleChangeImage}>
                        {profileImage || user?.profileImage ? (
                                <Image
                                    source={{
                                        uri: (profileImage || user?.profileImage) ?? "",
                                    }}
                                    style={styles.avatar}
                                />
                            ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={{ color: "#9ca3af" }}>Add Photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* NAME */}
                <View style={styles.card}>
                    <Text style={styles.label}>Name</Text>
                    {isEditing ? (
                        <TextInput value={name} onChangeText={setName} style={styles.input} />
                    ) : (
                        <Text style={styles.value}>{user?.name}</Text>
                    )}
                </View>

                {/* EMAIL */}
                <View style={styles.card}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user?.email}</Text>
                </View>

                {/* CITY */}
                <View style={styles.card}>
                    <Text style={styles.label}>City</Text>

                    {isEditing ? (
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setCityModalVisible(true)}
                        >
                            <Text style={{ color: cityId ? "#fff" : "#666" }}>
                                {cityId || "Select city"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.value}>{user?.cityId || "—"}</Text>
                    )}
                </View>

                {/* BIO */}
                <View style={styles.card}>
                    <Text style={styles.label}>Bio</Text>
                    {isEditing ? (
                        <TextInput
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            style={[styles.input, { height: 80 }]}
                        />
                    ) : (
                        <Text style={styles.value}>{user?.bio || "—"}</Text>
                    )}
                </View>

                {/* ACTIONS */}
                {isEditing ? (
                    <>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                            <Text style={styles.primaryText}>Save changes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel}>
                            <Text style={styles.secondaryText}>Cancel</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.push("/profile/my-events")}
                            >
                            <MaterialIcons name="event" size={18} color="#9ca3af" />
                            <Text style={styles.secondaryText}>My Events</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.push("/business/MyBusinessesScreen")}
                            >
                            <MaterialIcons name="store" size={18} color="#9ca3af" />
                            <Text style={styles.secondaryText}>My Businesses</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => router.push("/business/CreateBusinessScreen")}
                            >
                            <MaterialIcons name="add-business" size={18} color="#fff" />
                            <Text style={styles.primaryText}>Create business</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.warningButton} onPress={handleLogout}>
                            <MaterialIcons name="logout" size={18} color="#facc15" />
                            <Text style={styles.warningText}>Logout</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
                            <MaterialIcons name="delete" size={18} color="#ff6b6b" />
                            <Text style={styles.dangerText}>Delete account</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* CITY MODAL */}
                <CitySelectorModal
                    visible={cityModalVisible}
                    onClose={() => setCityModalVisible(false)}
                    onSelect={(city) => {
                        setCityId(city.name);
                    }}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#0B0F1A",
    },

    container: {
        flex: 1,
        padding: 16,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },

    title: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "700",
    },

    edit: {
        fontSize: 18,
    },

    avatarContainer: {
        alignItems: "center",
        marginBottom: 20,
    },

    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: "#FF7A00",
    },

    avatarPlaceholder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "#121826",
        justifyContent: "center",
        alignItems: "center",
    },

    card: {
        backgroundColor: "#121826",
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
    },

    label: {
        color: "#9ca3af",
        fontSize: 12,
        marginBottom: 6,
    },

    value: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "500",
    },

    input: {
        color: "#fff",
        fontSize: 15,
        borderBottomWidth: 1,
        borderColor: "#2A3348",
        paddingVertical: 4,
    },

    primaryButton: {
        backgroundColor: "#FF7A00",
        padding: 16,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "center",
    },

    primaryText: {
        color: "#fff",
        fontWeight: "600",
    },

    secondaryText: {
        color: "#9ca3af",
    },

    dangerText: {
        color: "#ff6b6b",
    },

    editButton: {
    backgroundColor: "#1A2233",
    padding: 8,
    borderRadius: 10,
    },

    secondaryButton: {
    backgroundColor: "#1A2233",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    },

    warningButton: {
    backgroundColor: "rgba(250,204,21,0.1)",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    },

    warningText: {
    color: "#facc15",
    fontWeight: "500",
    },

    dangerButton: {
    backgroundColor: "rgba(255,0,0,0.15)",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    },
});