import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBusiness } from "../api/business.api";
import { getMyBusinesses, deleteBusiness,getBusinessById, updateBusiness  } from "../api/business.api";


export const useMyBusinesses = () => {
    return useQuery({
        queryKey: ["my-businesses"],
        queryFn: getMyBusinesses,
    });
};

export const useDeleteBusiness = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBusiness,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-businesses"] });
        },
    });
};

export const useCreateBusiness = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBusiness,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-businesses"] });
        },
    });
};

export const useBusiness = (id?: string) => {
  return useQuery({
    queryKey: ["business", id],
    queryFn: () => getBusinessById(id as string),
    enabled: !!id, // 🔥 evita ejecución si no hay id
  });
};

export const useUpdateBusiness = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateBusiness,

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["business", variables.id],
            });
            queryClient.invalidateQueries({
                queryKey: ["my-businesses"],
            });
        },
    });
};