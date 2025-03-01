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
import { Feather } from "@expo/vector-icons";

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
                            : require("../../assets/icon.png")
                    }
                />
                <Text style={styles.profileName}>
                    {user.name || user.email.split("@")[0]}
                </Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
            </View>

            {/* Options Menu */}
            <View style={styles.menu}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push("/profile/edit")}
                >
                    <Feather name="edit" size={24} color="#fff" />
                    <Text style={styles.menuItemText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push("/favorites")}
                >
                    <Feather name="heart" size={24} color="#ff6b6b" />
                    <Text style={styles.menuItemText}>Favorites</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push("/profile/adoptions")}
                >
                    <Feather name="home" size={24} color="#fff" />
                    <Text style={styles.menuItemText}>My Adoptions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push("/profile/activity")}
                >
                    <Feather name="activity" size={24} color="#fff" />
                    <Text style={styles.menuItemText}>My Posts/Activity</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push("/profile/notifications")}
                >
                    <Feather name="bell" size={24} color="#fff" />
                    <Text style={styles.menuItemText}>Notifications</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push("/settings/account")}
                >
                    <Feather name="settings" size={24} color="#fff" />
                    <Text style={styles.menuItemText}>Account Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => console.log("Invite Friends")}
                >
                    <Feather name="users" size={24} color="#fff" />
                    <Text style={styles.menuItemText}>Invite Friends</Text>
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
        backgroundColor: "#000", // Dark background
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
        backgroundColor: "#222",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
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
        backgroundColor: "#222",
        margin: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.5,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
        backgroundColor: "#444",
    },
    profileName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#fff",
    },
    profileEmail: {
        fontSize: 16,
        color: "#ccc",
    },
    menu: {
        margin: 20,
        backgroundColor: "#222",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.5,
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
        borderBottomColor: "#333",
    },
    menuItemText: {
        fontSize: 18,
        color: "#fff",
        marginLeft: 16,
    },
    logoutButton: {
        borderBottomWidth: 0, // No border for the last item
    },
});
