import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRef } from "react";
import { router } from "expo-router";
import { setOnboardingSeen } from "../../src/shared/storage/onboarding";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Latinos near you",
    subtitle: "Discover events, food and people from your culture in your city.",
    image: require("../../assets/colombia.webp"),
  },
  {
    id: "2",
    title: "Find what’s happening",
    subtitle: "Parties, meetups, concerts and more — all in one place.",
    image: require("../../assets/mexico.webp"),
  },
  {
    id: "3",
    title: "Join the community",
    subtitle: "Save events, connect and never feel far from home again.",
    image: require("../../assets/peru.webp"),
  },
];

export default function OnboardingScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleStart = async () => {
    await setOnboardingSeen();
    router.replace("/(tabs)");
  };

  const renderItem = ({ item, index }: any) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    // 🔥 PARALLAX
    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: [-50, 0, 50],
    });

    // 🔥 FADE TEXT
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
    });

    return (
      <View style={{ width, height }}>
        {/* IMAGE */}
        <Animated.Image
          source={item.image}
          style={[
            styles.image,
            { transform: [{ translateX }] },
          ]}
        />

        {/* OVERLAY */}
        <View style={styles.overlay} />

        {/* TEXT */}
        <Animated.View style={[styles.content, { opacity }]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* 🔥 SLIDER */}
      <Animated.FlatList
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
      />

      {/* 🔥 CTA */}
      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Explore events</Text>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const opacity = scrollX.interpolate({
              inputRange: [
                (i - 1) * width,
                i * width,
                (i + 1) * width,
              ],
              outputRange: [0.3, 1, 0.3],
            });

            return (
              <Animated.View
                key={i}
                style={[styles.dot, { opacity }]}
              />
            );
          })}
        </View>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    position: "absolute",
    width: width * 1.2, // 🔥 importante para parallax
    height: "100%",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  content: {
    position: "absolute",
    bottom: 160,
    left: 24,
    right: 24,
  },

  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
  },

  subtitle: {
    color: "#d1d5db",
    fontSize: 16,
    marginTop: 10,
    lineHeight: 22,
  },

  button: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: "#FF7A00",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  dots: {
    position: "absolute",
    bottom: 100,
    flexDirection: "row",
    alignSelf: "center",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 4,
  },
});