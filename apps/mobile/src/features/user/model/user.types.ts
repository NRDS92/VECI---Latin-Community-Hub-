export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  cityId?: string;
  profileImage?: string | null;
  bio?: string | null;
  favorites: string[];
};