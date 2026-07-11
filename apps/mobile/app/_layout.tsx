import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../src/shared/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "react-native";
import { Modal, View } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import LoginScreen from "../src/features/auth/screens/LoginScreen";

const queryClient = new QueryClient();

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
});

function RootContent() {
  const { showLoginModal } = useAuth();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0B0F1A"
        translucent={false}
      />

      {/* ✅ APP */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#0B0F1A",
          },
        }}
      />

      {/* 🔥 MODAL GLOBAL (AQUÍ está la clave) */}
      <Modal visible={showLoginModal} animationType="slide">
        <View style={{ flex: 1 }}>
          <LoginScreen />
        </View>
      </Modal>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RootContent />
      </QueryClientProvider>
    </AuthProvider>
  );
}