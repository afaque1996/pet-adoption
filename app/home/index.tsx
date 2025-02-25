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

export default function HomeScreen() {
    const router = useRouter();
    const user = useAuth();
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch latest pets from Supabase
    useEffect(() => {
        const fetchPets = async () => {
            const { data, error } = await supabase
                .from("pets")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(20);
            if (!error) setPets(data || []);
            setLoading(false);
        };
        fetchPets();
    }, []);

    if (!user) return null; // Prevent flickering if user is not loaded

    // Header component with greeting, search button and horizontal categories
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.header}>
                <Text style={styles.greeting}>
                    🐾 Hello, {user?.email?.split("@")[0]}!
                </Text>
                <Text style={styles.subtitle}>Find or list a pet for adoption.</Text>
            </View>
            {/* Search button that redirects to the dedicated search screen */}
            <TouchableOpacity
                style={styles.searchButton}
                onPress={() => router.push("/adoption/search")}
            >
                <Text style={styles.searchButtonText}>🔍 Search</Text>
            </TouchableOpacity>
            {/* Horizontal categories */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
            >
                {["Dogs", "Cats", "Birds", "Rabbits", "Others"].map((category) => (
                    <TouchableOpacity key={category} style={styles.categoryButton}>
                        <Text style={styles.categoryText}>{category}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <Text style={styles.sectionTitle}>🐶 Recent Pets for Adoption</Text>
        </View>
    );

    // Footer component with action buttons
    const renderFooter = () => (
        <View style={styles.footer}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/adoption/list")}
            >
                <Text style={styles.buttonText}>🐶 View All Pets</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => router.push("/adoption/add")}
            >
                <Text style={styles.buttonText}>📋 List a Pet</Text>
            </TouchableOpacity>
        </View>
    );

    // Render each pet card as a vertically laid-out item
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
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeContainer}>
            {loading ? (
                <ActivityIndicator size="large" color="#ff6b6b" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={pets}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    ListHeaderComponent={renderHeader}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={styles.flatListContent}
                />
            )}
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
    header: {
        marginTop: 20,
        marginBottom: 20,
    },
    greeting: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
    },
    subtitle: {
        fontSize: 16,
        color: "#777",
        marginBottom: 10,
    },
    searchButton: {
        backgroundColor: "#ff6b6b",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
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
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 12,
        alignItems: "center",
        padding: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    petImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 10,
    },
    petInfo: {
        flex: 1,
    },
    petName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    petLocation: {
        fontSize: 12,
        color: "#777",
        marginTop: 4,
    },
    footer: {
        marginTop: 20,
    },
    button: {
        width: "100%",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
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
    },
});
