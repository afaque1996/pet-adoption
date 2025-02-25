import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Image,
    ActivityIndicator,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "expo-router";
import { supabase } from "../../supabaseConfig";
import { Feather } from "@expo/vector-icons"; // For icons

const ProfileScreen = () => {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#ff6b6b" />
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Feather name="user-x" size={50} color="#777" />
                    <Text style={styles.emptyText}>User not logged in.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            router.push("/auth/login");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <Image
                    style={styles.profileImage}
                    source={
                        user.avatar
                            ? { uri: user.avatar }
                            : require("../../assets/icon.png") // Replace with your default image
                    }
                />
                <Text style={styles.profileName}>
                    {user.name || user.email.split("@")[0]}
                </Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
            </View>

            {/* Menu */}
            <View style={styles.menu}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push("/favorites")}
                >
                    <Feather name="heart" size={24} color="#ff6b6b" />
                    <Text style={styles.menuItemText}>Favorites</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push("/settings")}
                >
                    <Feather name="settings" size={24} color="#333" />
                    <Text style={styles.menuItemText}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.menuItem, styles.logoutButton]}
                    onPress={handleLogout}
                >
                    <Feather name="log-out" size={24} color="red" />
                    <Text style={[styles.menuItemText, { color: "red" }]}>
                        Logout
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        color: "#777",
        marginTop: 10,
    },
    profileHeader: {
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
        margin: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
        backgroundColor: "#ddd",
    },
    profileName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
    },
    profileEmail: {
        fontSize: 16,
        color: "#777",
    },
    menu: {
        margin: 20,
        backgroundColor: "#fff",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    menuItemText: {
        fontSize: 18,
        color: "#333",
        marginLeft: 16,
    },
    logoutButton: {
        borderBottomWidth: 0, // Remove border for the last item
    },
});