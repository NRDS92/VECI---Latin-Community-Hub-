import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function BusinessDetailStatus({ isLoading, message }: { isLoading: boolean; message?: string }) {
  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator color="#FF7A00" accessibilityLabel="Loading business" />
      ) : (
        <Text style={styles.message}>{message ?? "Business unavailable"}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B0F1A",
  },
  message: { color: "#fff" },
});
