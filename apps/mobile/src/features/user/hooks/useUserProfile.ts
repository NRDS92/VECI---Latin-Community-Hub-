import { useQuery } from "@tanstack/react-query";
import { api } from "../../../api/clients";

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");
      return data;
    },
  });
};