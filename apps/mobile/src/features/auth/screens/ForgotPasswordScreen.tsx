import { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { forgotPasswordRequest } from "../../../shared/services/auth.service";
import AuthHeader from "../components/AuthHeader";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";

const background = require("../../../../assets/peru.webp");

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleForgotPassword = async () => {
  try {
        setLoading(true);
        setError("");

        await forgotPasswordRequest(email);
        

            router.replace({
                pathname: "/(auth)/login",
                params: {
                    email,
                },
            });

    } catch (error: any) {

        setError(
            error?.response?.data?.message ??
            "Unable to send reset email."
        );

    } finally {
        setLoading(false);
    }
    };

    return (
        <ImageBackground
        source={background}
        style={styles.container}
        >
        <LinearGradient
            colors={["rgba(0,0,0,0.6)", "#0B0F1A"]}
            style={StyleSheet.absoluteFill}
        />

        <View style={styles.content}>

            <AuthHeader
                title="Forgot Password"
                subtitle="Enter your email and we'll send you a secure link to reset your password."
            />

            <AuthInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                keyboardType="email-address"
            />

            {error ? (
                <Text style={styles.error}>
                    {error}
                </Text>
            ) : null}

            <View style={styles.buttonContainer}>
                <AuthButton
                    title="Send reset link"
                    loading={loading}
                    disabled={!email.trim()}
                    onPress={handleForgotPassword}
                />
            </View>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Text style={styles.backText}>
                    ← Back to Login
                </Text>
            </TouchableOpacity>

        </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
    },

    content: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
    },

    buttonContainer: {
        marginTop: 20,
    },

    backButton: {
        marginTop: 24,
        alignItems: "center",
    },

    backText: {
        color: "#FF7A00",
        fontWeight: "600",
        fontSize: 14,
    },
    error: {
        color: "#FF6B6B",
        textAlign: "center",
        marginTop: 16,
        marginBottom: 8,
    },

});