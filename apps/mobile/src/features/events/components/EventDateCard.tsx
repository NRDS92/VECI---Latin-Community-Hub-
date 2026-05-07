import { View, Text, StyleSheet } from "react-native";

type Props = {
  date: string | Date;
};

const formatEventDate = (date: string | Date) => {
  const d = new Date(date);

  return {
    day: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
    date: d.getDate(),
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
  };
};

export default function EventDateCard({ date }: Props) {
  const formatted = formatEventDate(date);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
  {formatted.day}{" "}
  <Text style={styles.date}>{formatted.date}</Text>{" "}
  {formatted.month}
</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "rgba(0,0,0,0.4)", // 👈 glass effect
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        
    },

  day: {
    color: "#9ca3af",
    fontSize: 12,
    marginRight: 4,
  },
  text: {
  color: "#ffffff",
  fontSize: 12,
},

  date: {
    color: "#FF7A00",
    fontSize: 18,
    fontWeight: "800",
    marginRight: 4,
  },

  month: {
    color: "#9ca3af",
    fontSize: 12,
  },
});