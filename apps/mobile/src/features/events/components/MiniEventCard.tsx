import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

type EventItem = {
  _id: string;
  title: string;
  images?: string[];
  dateStart: string;
};

type Props = {
  item: EventItem;
};

export default function MiniEventCard({ item }: Props) {
    return (
        <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/event/${item._id}`)}
        >
        <Image
            source={{ uri: item.images?.[0] }}
            style={styles.image}
        />

        <Text style={styles.title} numberOfLines={1}>
            {item.title}
        </Text>

        <Text style={styles.date}>
            {new Date(item.dateStart).toLocaleDateString()}
        </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    marginRight: 12,
  },
  image: {
    width: "100%",
    height: 80,
    borderRadius: 10,
  },
  title: {
    color: "#fff",
    marginTop: 6,
  },
  date: {
    color: "#9ca3af",
    fontSize: 12,
  },
});