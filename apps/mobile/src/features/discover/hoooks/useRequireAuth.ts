import { useEffect } from "react";
import { useAuth } from "../../../shared/context/AuthContext";

export const useRequireAuth = (action?: () => void) => {
    const {
        token,
        showLoginModal,
        setShowLoginModal,
        setPendingAction,
    } = useAuth();

    useEffect(() => {
        // SOLO abrir si:
        // 1. no hay token
        // 2. el modal NO está ya abierto
        if (!token && !showLoginModal) {
        setShowLoginModal(true);

        if (action) {
            setPendingAction(() => action);
        }
        }
    }, [token, showLoginModal]);
};