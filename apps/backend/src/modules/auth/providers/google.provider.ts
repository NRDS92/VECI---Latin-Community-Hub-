import axios from "axios";

export const verifyGoogleToken = async (accessToken: string) => {
  const res = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return res.data;
};