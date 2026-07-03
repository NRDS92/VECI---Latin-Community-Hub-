import axios from "axios";
import { AppError } from "../../../shared/errors/AppError";

interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export const verifyGoogleToken = async (
  accessToken: string
): Promise<GoogleUser> => {
  try {
    const { data } = await axios.get<GoogleUser>(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!data.email || !data.sub) {
      throw new AppError(
        "Invalid Google account.",
        401,
        "INVALID_GOOGLE_TOKEN"
      );
    }

    return data;
  } catch (error) {
    throw new AppError(
      "Google authentication failed.",
      401,
      "INVALID_GOOGLE_TOKEN"
    );
  }
};