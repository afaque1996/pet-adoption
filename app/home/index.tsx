import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
} from "react-native";
import { supabase } from "../../supabaseConfig";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import FavoriteButton from "../../components/FavoriteButton";
import { Feather } from "@expo/vector-icons"; // For icons

export default function HomeScreen() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [pets, setPets] = useState<any[]>([]);
    const [petsLoading, setPetsLoading] = useState(true);

    useEffect(() => {
        const fetchPets = async () => {
            setPetsLoading(true);
            const { data, error } = await supabase
                .from("pets")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(20);
            if (!error) setPets(data || []);
            setPetsLoading(false);
        };
        fetchPets();
    }, []);

    if (loading || petsLoading) {
        return (
            <SafeAreaView style={styles.safeContainer}>
                <ActivityIndicator size="large" color="#ff6b6b" style={{ marginTop: 20 }} />
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.safeContainer}>
                <View style={styles.emptyContainer}>
                    <Feather name="user-x" size={50} color="#777" />
                    <Text style={styles.emptyText}>User not logged in.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.topBar}>
                <Text style={styles.greeting}>
                    🐾 Hello, {user.email.split("@")[0]}!
                </Text>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => router.push("/profile")}
                >
                    <Feather name="user" size={24} color="#333" />
                </TouchableOpacity>
            </View>
            <View style={styles.subHeader}>
                <Text style={styles.subtitle}>Find or list a pet for adoption.</Text>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => router.push("/adoption/search")}
                >
                    <Feather name="search" size={20} color="#fff" />
                    <Text style={styles.searchButtonText}> Search</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
            >
                {["Dogs", "Cats", "Birds", "Rabbits", "Others"].map((category) => (
                    <TouchableOpacity key={category} style={styles.categoryButton}>
                        <Feather name="tag" size={16} color="#fff" />
                        <Text style={styles.categoryText}> {category}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <Text style={styles.sectionTitle}>Recent Pets for Adoption</Text>
        </View>
    );

    const renderFooter = () => (
        <View style={styles.footer}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/adoption/list")}
            >
                <Feather name="list" size={20} color="#fff" />
                <Text style={styles.buttonText}> View All Pets</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => router.push("/adoption/add")}
            >
                <Feather name="plus" size={20} color="#fff" />
                <Text style={styles.buttonText}> List a Pet</Text>
            </TouchableOpacity>
        </View>
    );

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.petCard}
            onPress={() => router.push(`/adoption/details?id=${item.id}`)}
        >
            <Image source={{ uri: item.image_url }} style={styles.petImage} />
            <View style={styles.petInfo}>
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.petLocation}>📍 {item.location}</Text>
            </View>
            <FavoriteButton petId={item.id} userId={user.id} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeContainer}>
            <FlatList
                data={pets}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.flatListContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: "#f9f9f9",
    },
    flatListContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerContainer: {
        marginBottom: 20,
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 10,
    },
    greeting: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
    },
    profileButton: {
        backgroundColor: "#fff",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    subHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#777",
    },
    searchButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ff6b6b",
        padding: 10,
        borderRadius: 8,
    },
    searchButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    categoryContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    categoryButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ff6b6b",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        marginRight: 10,
    },
    categoryText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    petCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
        alignItems: "center",
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    petImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 16,
    },
    petInfo: {
        flex: 1,
    },
    petName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    petLocation: {
        fontSize: 14,
        color: "#777",
        marginTop: 4,
    },
    footer: {
        marginTop: 20,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: 14,
        borderRadius: 8,
        backgroundColor: "#ff6b6b",
        marginBottom: 12,
    },
    secondaryButton: {
        backgroundColor: "#4CAF50",
    },
    buttonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
        marginLeft: 8,
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
});