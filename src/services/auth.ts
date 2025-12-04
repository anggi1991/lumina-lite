import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';

// Google Sign-In configuration moved to AuthScreen to ensure Activity context

export const signInWithGoogle = async () => {
    try {
        console.log('[Auth] Initiating Google Sign-In...');
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
            offlineAccess: true,
            forceCodeForRefreshToken: true,
        });
        await GoogleSignin.hasPlayServices();
        console.log('[Auth] Play Services available.');
        const userInfo: any = await GoogleSignin.signIn();
        console.log('[Auth] Google Sign-In success, user info retrieved.');

        // Check if idToken exists (handling different versions/types)
        const idToken = userInfo.data?.idToken || userInfo.idToken;

        if (idToken) {
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
            });

            if (error) {
                console.log('[Auth] Supabase sign-in with ID token failed:', error.message);
                return { session: null, user: null, error };
            }
            console.log('[Auth] Supabase session created successfully.');
            const { session, user } = data; // Destructure session and user from data
            return { session, user: user || null, error: null };
        } else {
            console.log('[Auth] No ID token present in Google Sign-In response.');
            return { session: null, user: null, error: new Error('No ID token present!') };
        }
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled the login flow
            console.log('Sign in cancelled');
        } else if (error.code === statusCodes.IN_PROGRESS) {
            // operation (e.g. sign in) is in progress already
            console.log('Sign in in progress');
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // play services not available or outdated
            console.log('Play services not available');
        } else {
            // some other error happened
            console.error(error);
        }
        throw error;
    }
};

export const signOut = async () => {
    try {
        await GoogleSignin.signOut();
        await supabase.auth.signOut();
    } catch (error) {
        console.error(error);
    }
};

export const signInWithEmail = async (email: string, password: string) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.log('[Auth] Supabase email sign-in failed:', error.message);
            return { session: null, user: null, error };
        }

        const { session, user } = data;
        return { session, user: user || null, error: null };
    } catch (error: any) {
        console.error('[Auth] Unexpected error during email sign-in:', error?.message || error);
        throw error;
    }
};
