import { useState } from "react";
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
import { router } from "expo-router";
import { api } from "../../../api/clients";
import GoogleButton from "../components/GoogleButton";

const logo = require("../../../../assets/splash.png");
const colombiaImg = require("../../../../assets/colombia.webp");

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cityId] = useState("Cologne");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validate = () => {
    if (!name.trim()) return "Name is required";
    if (!email.includes("@")) return "Invalid email";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleRegister = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.post("/auth/register", {
        name,
        email,
        password,
        cityId,
      });

      setSuccess("Check your email to verify your account 📩");

      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={colombiaImg}
      style={styles.container}
    >
      {/* OVERLAY */}
      <LinearGradient
        colors={["rgba(0,0,0,0.6)", "#0B0F1A"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        {/* TITLE */}
        <Text style={styles.title}>Register</Text>

        {/* NAME */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
        </View>

        {/* EMAIL */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
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

        {/* SUCCESS */}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        {/* REGISTER */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>Create account</Text>
          )}
        </TouchableOpacity>

        {/* LOGIN LINK */}
        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.linkText}>
            Already have an account?{" "}
            <Text style={styles.linkHighlight}>Login</Text>
          </Text>
        </TouchableOpacity>

        {/* GOOGLE */}
        <View style={{ marginTop: 16 }}>
          <GoogleButton />
        </View>
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
    padding: 24,
  },

  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 30,
  },
    logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 10,
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
    textAlign: "center",
    marginBottom: 10,
  },

  success: {
    color: "#4ade80",
    textAlign: "center",
    marginBottom: 10,
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
  },

  linkHighlight: {
    color: "#FF7A00",
    fontWeight: "600",
  },
});