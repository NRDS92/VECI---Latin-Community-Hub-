import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../../features/user/model/user.types";
import { getMe } from "../../features/user/api/user.api";

type AuthContextType = {
  token: string | null;
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  showLoginModal: boolean;
  setShowLoginModal: React.Dispatch<React.SetStateAction<boolean>>;
  setPendingAction: React.Dispatch<React.SetStateAction<(() => void) | null>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [token, setToken] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (!storedToken || !storedUser) return;

        // ✅ set inmediato (sin flicker)
        setToken(storedToken);

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setFavorites(parsedUser.favorites || []);

        try {
          const freshUser = await getMe();

          setUser(freshUser);
          setFavorites(freshUser.favorites || []);

          await AsyncStorage.setItem("user", JSON.stringify(freshUser));
        } catch (err) {
          console.log("Silent refresh failed");
        }

      } catch (error) {
        console.log("SESSION ERROR", error);

        await AsyncStorage.multiRemove(["token", "user"]);

        setToken(null);
        setUser(null);
        setFavorites([]);
      }
    };

    loadSession();
  }, []);

  // SYNC FAVORITES
  useEffect(() => {
    if (user?.favorites) {
      setFavorites(user.favorites);
    }
  }, [user]);

  const login = async (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    setFavorites(userData.favorites || []);

    await AsyncStorage.setItem("token", newToken);
    await AsyncStorage.setItem("user", JSON.stringify(userData));

    // 🔥 ejecutar acción pendiente (ej: attend)
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }

    setShowLoginModal(false);
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);

      setToken(null);
      setFavorites([]);
      setUser(null);
      setPendingAction(null);
      setShowLoginModal(false);
    } catch (error) {
      console.error("Logout error", error);
    }
  };


  return (
    <AuthContext.Provider
      value={{
        token,
        favorites,
        setFavorites,
        login,
        logout,
        showLoginModal,
        setShowLoginModal,
        setPendingAction,
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};