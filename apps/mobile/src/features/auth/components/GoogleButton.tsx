import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useEffect } from "react";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { api } from "../../../../src/api/clients";
import { useAuth } from "../../../shared/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function GoogleButton() {
    const { promptAsync, response } = useGoogleAuth();
    const { login } = useAuth();

    useEffect(() => {
        if (response?.type === "success") {
        const accessToken = response.authentication?.accessToken;
        if (!accessToken) return;

        handleGoogleLogin(accessToken);
        }
    }, [response]);

    const handleGoogleLogin = async (accessToken: string) => {
        try {
        const res = await api.post("/auth/google", { accessToken });
        const data = res.data.data;

        await login(data.token, data.user);
        } catch (err) {
        console.log("Google login error", err);
        }
    };

    return (
        <TouchableOpacity style={styles.button} onPress={() => promptAsync()}>
        <View style={styles.content}>
            {/* 🔥 ICONO GOOGLE */}
            <Ionicons name="logo-google" size={18} color="#fff" />

            <Text style={styles.text}>Continue with Google</Text>
        </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#1A2233",
        padding: 14,
        borderRadius: 16,
        alignItems: "center",
    },

    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    text: {
        color: "#fff",
        fontWeight: "500",
        fontSize: 14,
    },
});