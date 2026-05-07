import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "hasSeenOnboarding";

export const setOnboardingSeen = async () => {
    await AsyncStorage.setItem(KEY, "true");
};

export const hasSeenOnboarding = async () => {
    const value = await AsyncStorage.getItem(KEY);
    return value === "true";
};