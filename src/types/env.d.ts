declare namespace NodeJS {
    interface ProcessEnv {
        EXPO_PUBLIC_SUPABASE_URL: string;
        EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
        EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: string;
        EXPO_PUBLIC_IOS_CLIENT_ID?: string;
        EXPO_PUBLIC_ANDROID_CLIENT_ID?: string;
        EXPO_PUBLIC_AZURE_OPENAI_ENDPOINT?: string;
        EXPO_PUBLIC_AZURE_OPENAI_KEY?: string;
        EXPO_PUBLIC_AZURE_OPENAI_DEPLOYMENT?: string;
        EXPO_PUBLIC_AZURE_OPENAI_API_VERSION?: string;
        EXPO_PUBLIC_ADMOB_APP_ID_ANDROID?: string;
        EXPO_PUBLIC_ADMOB_APP_ID_IOS?: string;
    }
}
