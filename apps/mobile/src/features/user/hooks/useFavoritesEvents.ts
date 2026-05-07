import { useQuery } from "@tanstack/react-query";
import { getFavoriteEvents } from "../../user/api/user.api";

export const useFavoriteEvents = () => {
  return useQuery({
    queryKey: ["favorite-events"],
    queryFn: getFavoriteEvents,
  });
};