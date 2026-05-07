import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventById } from "../api/getEventsById";
import {getMyEvents, deleteEvent, updateEvent} from "../api/events.api";

export const useEvent = (id: string) => {
    return useQuery({
        queryKey: ["event", id],
        queryFn: () => getEventById(id),
        enabled: !!id,
    });
};

export const useMyEvents = () => {
    return useQuery({
        queryKey: ["my-events"],
        queryFn: getMyEvents,
    });
};

export const useDeleteEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteEvent,

        onSuccess: (data) => {
            console.log("DELETE SUCCESS:", data);

            queryClient.invalidateQueries({ queryKey: ["my-events"] });
            queryClient.invalidateQueries({ queryKey: ["discover"] });
        },

        onError: (error: any) => {
            console.log(
                "DELETE ERROR:",
                error?.response?.data || error.message
            );
        },
    });
};

export const useUpdateEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: any) => updateEvent(id, data),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["my-events"] });
            queryClient.invalidateQueries({ queryKey: ["event", variables.id] });
        },
    });
};