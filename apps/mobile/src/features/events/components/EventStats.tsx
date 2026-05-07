import { View, Text, StyleSheet } from "react-native";

type Props = {
  views?: number;
  attendees?: number;
};

export default function EventStats({ views, attendees }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>👁 {views ?? 0} views</Text>
      <Text style={styles.text}>🔥 {attendees ?? 0} attending</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  text: {
    color: "#9ca3af",
  },
});