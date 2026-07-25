import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../shared/context/AuthContext";
import { toggleFavorite } from "../services/favorite.service";

export const useFavorites = () => {
  const queryClient = useQueryClient();

  const {
    favorites = [],
    setFavorites,
    token,
    setShowLoginModal,
    setPendingAction,
  } = useAuth();

  const handleToggle = async (eventId: string) => {
    if (!token) {
      setPendingAction(() => () => handleToggle(eventId));
      setShowLoginModal(true);
      return;
    }

    const prevFavorites = [...favorites];

    setFavorites((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );

    try {
      const updatedFavorites = await toggleFavorite(eventId);

      setFavorites(updatedFavorites);

      await queryClient.invalidateQueries({
        queryKey: ["favorite-events"],
      });
    } catch (error) {
      console.log(error);
      setFavorites(prevFavorites);
    }
  };

  const isFavorite = useCallback(
    (eventId: string) => favorites.includes(eventId),
    [favorites]
  );

  return {
    favorites,
    handleToggle,
    isFavorite,
  };
};