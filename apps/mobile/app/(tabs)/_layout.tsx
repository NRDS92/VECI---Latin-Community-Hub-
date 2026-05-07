import { Tabs } from "expo-router";
import { StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/shared/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { user, setShowLoginModal } = useAuth();
  const insets = useSafeAreaInsets();

  const handleProtectedPress = (e: any, onPress?: (e: any) => void) => {
    if (!user) {
      e.preventDefault(); // 🔥 evita navegación
      setShowLoginModal(true);
    } else {
      onPress?.(e);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            height: 75 + insets.bottom,
          },
        ],
        tabBarItemStyle: styles.tabItem,
        tabBarActiveTintColor: "#FF7A00",
        tabBarInactiveTintColor: "#6b7280",
      }}
    >
      {/* 🔍 DISCOVER */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass-outline" size={24} color={color} />
          ),
        }}
      />

      {/* ➕ CREATE */}
      <Tabs.Screen
        name="create-event"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="add" size={26} color={color} />
          ),
          tabBarButton: (props) => (
            <Pressable
              style={props.style}
              onPress={(e) => handleProtectedPress(e, props.onPress)}
            >
              {props.children}
            </Pressable>
          ),
        }}
      />

      {/* ❤️ FAVORITES */}
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={24} color={color} />
          ),
        }}
      />

      {/* 👤 PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
          tabBarButton: (props) => (
            <Pressable
              style={props.style}
              onPress={(e) => handleProtectedPress(e, props.onPress)}
            >
              {props.children}
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    paddingBottom: 10,
    backgroundColor: "rgba(15, 20, 32, 0.85)",
    borderTopWidth: 0,
    justifyContent: "center",
    alignItems: "center",
    elevation: 0,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});