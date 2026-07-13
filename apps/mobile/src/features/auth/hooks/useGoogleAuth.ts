import { useCallback } from "react";
import {
    GoogleSignin,
    statusCodes,
} from "@react-native-google-signin/google-signin";

export function useGoogleAuth() {
    const signIn = useCallback(async (): Promise<string> => {
        try {
            // Verifica que Google Play Services esté disponible
            await GoogleSignin.hasPlayServices();

            const response = await GoogleSignin.signIn();
            if (response) {
                console.log("Google SignIn Response: Success");
            }
            
            const idToken = response.data?.idToken;

            if (!idToken) {
                throw new Error("Google did not return an ID Token.");
            }

        return idToken;
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                throw new Error("Google Sign-In cancelled.");
            }

            if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                throw new Error("Google Play Services not available.");
            }

            throw error;
        }
    }, []);

    return {
        signIn,
    };
}