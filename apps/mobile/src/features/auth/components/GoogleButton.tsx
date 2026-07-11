import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { googleLoginRequest } from "../../../shared/services/auth.service";
import { useAuth } from "../../../shared/context/AuthContext";

export default function GoogleButton() {
  const { signIn } = useGoogleAuth();
  const { login } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      // 1. Obtener ID Token desde Google
      const idToken = await signIn();

      console.log("Google ID Token:", idToken);

      // 2. Enviarlo al backend
      const { token, user } = await googleLoginRequest(idToken);

      // 3. Guardar sesión
      await login(token, user);

      // 4. Navegación
      if (!user.onboardingCompleted) {
        router.replace("/onboarding");
        return;
      }

      router.replace("/(tabs)");

    } catch (error) {
      console.error("Google Login Error:", error);

      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleGoogleLogin}
    >
      <View style={styles.content}>
        <Ionicons
          name="logo-google"
          size={18}
          color="#fff"
        />

        <Text style={styles.text}>
          Continue with Google
        </Text>
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