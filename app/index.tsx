import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function IndexRedirect() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true); // Ensures the layout is mounted before navigation
    }, []);

    useEffect(() => {
        if (mounted) {
            router.replace("/home"); // Redirect only after mount
        }
    }, [mounted]);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#ff6b6b" />
        </View>
    );
}
