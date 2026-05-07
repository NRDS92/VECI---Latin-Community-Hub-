import { api } from "../../api/clients";

export const loginRequest = async (email: string, password: string) => {
  const res = await api.post("/auth/login", {
    email,
    password,
  });

  return res.data.data as {
    user: any;
    token: string;
  };
};