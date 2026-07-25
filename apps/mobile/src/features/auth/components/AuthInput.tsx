import { Text, TextInput, StyleSheet, View } from "react-native";

interface AuthInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    secureTextEntry?: boolean;
    keyboardType?:
        | "default"
        | "email-address"
        | "numeric"
        | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export default function AuthInput({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "none",
    }: AuthInputProps) {
    return (
        <View style={styles.container}>
        <Text style={styles.label}>
            {label}
        </Text>

        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#6B7280"
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            style={styles.input}
        />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#121826",
        borderRadius: 16,
        padding: 14,
        marginBottom: 14,
    },

    label: {
        color: "#9CA3AF",
        fontSize: 12,
        marginBottom: 6,
    },

    input: {
        color: "#FFFFFF",
        fontSize: 15,
    },
});