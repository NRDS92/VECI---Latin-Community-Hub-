import { api } from "../../api/clients";

export const loginRequest = async (
  email: string,
  password: string
) => {
  const res = await api.post("/auth/login", {
    email,
    password,
  });

  return res.data.data as {
    user: any;
    token: string;
  };
};

export const googleLoginRequest = async (
  idToken: string
) => {
  const res = await api.post("/auth/google", {
    idToken,
  });

  return res.data.data as {
    user: any;
    token: string;
  };
};

export const forgotPasswordRequest = async (
  email: string
) => {
  console.log(api.defaults.baseURL); 
  const res = await api.post("/auth/forgot-password", {
    email,
  });
   
  return res.data;
};