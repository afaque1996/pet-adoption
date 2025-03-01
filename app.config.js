import 'dotenv/config';

export default {
    expo: {
        name: "PetAdoptionApp",
        slug: "PetAdoptionApp",
        scheme: "petadoptionapp",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        newArchEnabled: true,
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            }
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        plugins: [
            "expo-router"
        ],
        extra: {
            eas: {
                "projectId": "bb99f5b6-0dad-431a-967a-6c46f4ef05fe"
            },
            EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
            EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
        }
    }
};
