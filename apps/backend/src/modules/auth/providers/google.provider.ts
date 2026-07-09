import { OAuth2Client } from "google-auth-library";
import { AppError } from "../../../shared/errors/AppError";
import axios from "axios";

interface GoogleAuthorization {
    code: string;
    codeVerifier: string;
    redirectUri: string;
}

const client = new OAuth2Client(
  process.env.GOOGLE_WEB_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

/**
 * Intercambia el Authorization Code por los tokens de Google.
 */
const exchangeCodeForTokens = async (
  authorization: GoogleAuthorization
): Promise<string> => {
  try {
    console.log("=== GOOGLE TOKEN EXCHANGE ===");
    console.log("Code:", authorization.code);
    console.log("Redirect URI:", authorization.redirectUri);
    console.log("Client ID:", process.env.GOOGLE_WEB_CLIENT_ID);
    console.log("Has Client Secret:", !!process.env.GOOGLE_CLIENT_SECRET);
    console.log("Code Verifier:", authorization.codeVerifier);

    const { data } = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code: authorization.code,
        client_id: process.env.GOOGLE_WEB_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: authorization.redirectUri,
        grant_type: "authorization_code",
        code_verifier: authorization.codeVerifier,
      }
    );

    if (!data.id_token) {
      throw new Error("Google did not return an ID Token.");
    }

    return data.id_token;

  } catch (error) {

    if (axios.isAxiosError(error)) {
      console.error("Google Response:", error.response?.data);
    }

    console.error(error);

    throw new AppError(
      "Unable to exchange Google authorization code.",
      401,
      "GOOGLE_TOKEN_EXCHANGE_FAILED"
    );
  }
};

/**
 * Verifica el ID Token utilizando las claves públicas de Google.
 */
const verifyIdToken = async (
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
      name: payload.name || "",
      picture: payload.picture,
    };

  } catch (error) {
    console.error("Google Verify Token Error:", error);

    throw new AppError(
      "Google authentication failed.",
      401,
      "INVALID_GOOGLE_TOKEN"
    );
  }
};

/**
 * Función pública del Provider.
 *
 * Recibe un Authorization Code y devuelve
 * un usuario verificado de Google.
 */
export const authenticateGoogleUser = async (
  authorization: GoogleAuthorization
): Promise<GoogleUser> => {

  const idToken = await exchangeCodeForTokens(authorization);

  return verifyIdToken(idToken);

};