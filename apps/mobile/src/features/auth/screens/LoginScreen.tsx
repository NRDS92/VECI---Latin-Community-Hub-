import { useState } from "react";
import { router } from "expo-router";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { loginRequest } from "../../../shared/services/auth.service";
import { useAuth } from "../../../shared/context/AuthContext";
import { mapUserFromApi } from "../../user/model/user.mapper";
import GoogleButton from "../components/GoogleButton";

const logo = require("../../../../assets/splash.png");
const colombiaImg = require("../../../../assets/peru.webp");

export default function LoginScreen() {
  const { login, setShowLoginModal } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const { user, token } = await loginRequest(email, password);

      await login(token, user);

    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Login failed";

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  const handleGoToRegister = () => {
    setShowLoginModal(false);
    requestAnimationFrame(() => {
      router.push("/(auth)/register");
    });
  };

  const handleClose = () => {
    setShowLoginModal(false);
    router.replace("/(tabs)"); // 🔥 ir a discover
  };

  return (
    <ImageBackground source={colombiaImg} style={styles.container}>
      {/* OVERLAY */}
      <LinearGradient
        colors={["rgba(0,0,0,0.6)", "#0B0F1A"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
         <Image source={logo} style={styles.logo} resizeMode="contain" />
        {/* TITLE */}
        <Text style={styles.title}>Welcome back</Text>

        {/* EMAIL */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            placeholder="your@email.com"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
        </View>

        {/* PASSWORD */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
        </View>

        {/* ERROR */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* LOGIN */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* GOOGLE */}
        <View style={{ marginTop: 12 }}>
          <GoogleButton />
        </View>

        {/* REGISTER */}
        <TouchableOpacity
          style={styles.linkContainer}
          onPress={handleGoToRegister}
        >
          <Text style={styles.linkText}>
            Don't have an account?{" "}
            <Text style={styles.linkHighlight}>Register</Text>
          </Text>
        </TouchableOpacity>

        {/* CLOSE */}
        <TouchableOpacity style={styles.secondaryButton} onPress={handleClose}>
          <Text style={styles.secondaryText}>Continue without account</Text>
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
    padding: 24, // 🔥 padding consistente
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 10,
  },

  title: {
    color: "#fff",
    fontSize: 34, // 🔥 más grande
    fontWeight: "800",
    textAlign: "center", // 🔥 centrado
    marginBottom: 30,
  },

  inputBox: {
    backgroundColor: "#121826",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  label: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 6,
  },

  input: {
    color: "#fff",
    fontSize: 14,
  },

  error: {
    color: "#ff6b6b",
    marginBottom: 10,
    textAlign: "center",
  },

  primaryButton: {
    backgroundColor: "#FF7A00",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,

    shadowColor: "#FF7A00",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  linkContainer: {
    marginTop: 16,
    alignItems: "center",
  },

  linkText: {
    color: "#9ca3af",
    fontSize: 14,
  },

  linkHighlight: {
    color: "#FF7A00",
    fontWeight: "600",
  },

  secondaryButton: {
    backgroundColor: "#1A2233",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 16,
  },

  secondaryText: {
    color: "#9ca3af",
  },
});