import { OAuth2Client } from "google-auth-library";
import { AppError } from "../../../shared/errors/AppError";

const client = new OAuth2Client(
  process.env.GOOGLE_WEB_CLIENT_ID
);

export interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export const authenticateGoogleUser = async (
  idToken: string
): Promise<GoogleUser> => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      throw new Error("Invalid Google payload.");
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name ?? "",
      picture: payload.picture,
    };

  } catch (error) {

    console.error("========== GOOGLE VERIFY ==========");
    console.error(error);
    console.error("==================================");

    throw new AppError(
      "Google authentication failed.",
      401,
      "INVALID_GOOGLE_TOKEN"
    );
  }
};