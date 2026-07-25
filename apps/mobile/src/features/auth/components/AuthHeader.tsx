import { Image, StyleSheet, Text, View } from "react-native";

const logo = require("../../../../assets/splash.png");

interface Props {
  title: string;
  subtitle?: string;
}

export default function AuthHeader({
  title,
  subtitle,
}: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={logo}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 28,
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },

  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    color: "#9CA3AF",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
  },
});