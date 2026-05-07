import { useMutation } from "@tanstack/react-query";
import {
  trackEventView,
  attendEvent,
} from "../services/eventTracking.service";

export function useEventTracking() {
  const viewMutation = useMutation({
    mutationFn: trackEventView,
    onError: (err) => {
      console.log("❌ VIEW ERROR", err);
    },
  });

  const attendMutation = useMutation({
    mutationFn: attendEvent,

    onSuccess: (data) => {
      console.log("🔥 ATTEND success", data);
    },

    onError: (err) => {
      console.log("❌ ATTEND ERROR", err);
    },
  });

  return {
    trackView: viewMutation.mutateAsync,

    attend: async (eventId: string) => {
    const res = await attendMutation.mutateAsync(eventId);

    console.log("✅ RESPONSE ATTEND:", res);

    return res;
  },

    isAttendingLoading: attendMutation.isPending, // 🔥 rename correcto
  };
}