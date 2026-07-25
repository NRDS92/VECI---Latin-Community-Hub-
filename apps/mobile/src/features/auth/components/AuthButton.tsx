import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
} from "react-native";

interface AuthButtonProps {
    title: string;
    loading?: boolean;
    disabled?: boolean;
    onPress: () => void;
}

export default function AuthButton({
    title,
    loading = false,
    disabled = false,
    onPress,
}: AuthButtonProps) {

    const isDisabled = loading || disabled;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isDisabled && styles.disabled,
            ]}
            disabled={isDisabled}
            onPress={onPress}
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" />
            ) : (
                <Text style={styles.text}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({

    button: {
        backgroundColor: "#FF7A00",

        paddingVertical: 16,

        borderRadius: 16,

        alignItems: "center",

        shadowColor: "#FF7A00",
        shadowOpacity: 0.4,
        shadowRadius: 10,

        elevation: 6,
    },

    disabled: {
        opacity: 0.6,
    },

    text: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },

});