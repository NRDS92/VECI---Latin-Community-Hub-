import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvent } from "../api/events.api";

export const useCreateEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createEvent,

        onSuccess: () => {
        // 🔥 refresca el discover automáticamente
        queryClient.invalidateQueries({ queryKey: ["discover"] });
        },
    });
};