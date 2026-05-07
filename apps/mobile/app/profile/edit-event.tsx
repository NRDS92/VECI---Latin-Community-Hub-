import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEvent, useUpdateEvent } from "../../src/features/events/hooks/useEvents";


export default function EditEventScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const { data, isLoading } = useEvent(id);
    const updateMutation = useUpdateEvent();

    if (isLoading) return <Text>Loading...</Text>;

    const handleSubmit = () => {
        updateMutation.mutate({
            id,
            data: {
                title: "Updated title",
            },
        });
    };
        return (
        <View>
            <Text>Edit Event</Text>
            {/* 👉 aquí reutilizas tu EventForm */}
        </View>
    );
}