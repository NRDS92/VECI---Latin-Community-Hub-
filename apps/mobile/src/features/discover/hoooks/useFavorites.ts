import { useAuth } from "../../../shared/context/AuthContext";
import { toggleFavorite } from "../services/favorite.service";
import { useCallback } from "react";

export const useFavorites = () => {
  const {
    favorites = [],
    setFavorites,
    token,
    setShowLoginModal,
    setPendingAction,
  } = useAuth();

  const handleToggle = async (eventId: string) => {
    // 🔐 no auth
    if (!token) {
      console.log("❌ NO TOKEN → LOGIN");
      setPendingAction(() => () => handleToggle(eventId));
      setShowLoginModal(true);
      return;
    }

    const prevFavorites = [...favorites];

    // 🔥 optimistic update
    setFavorites((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );

    try {
      const updatedFavorites = await toggleFavorite(eventId);

      // 🔥 backend is source of truth
      setFavorites(updatedFavorites);
    } catch (error) {
      console.log("FAVORITE ERROR", error);

      // rollback
      setFavorites(prevFavorites);
    }
  };

  // 🔥 MEMOIZED (CLAVE)
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