import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../supabaseConfig";

export default function ListPetScreen() {
    const router = useRouter();
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch pets from Supabase
    useEffect(() => {
        const fetchPets = async () => {
            const { data, error } = await supabase.from("pets").select("*").order("created_at", { ascending: false });
            if (!error) setPets(data || []);
            setLoading(false);
        };
        fetchPets();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff6b6b" />
                <Text style={styles.loadingText}>Fetching pets...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>🐾 Pets Available for Adoption</Text>
                {pets.length === 0 ? (
                    <Text style={styles.noPetsText}>No pets available right now. Check back later!</Text>
                ) : (
                    <FlatList
                        data={pets}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.petCard} onPress={() => router.push(`/adoption/details?id=${item.id}`)}>
                                <Image source={{ uri: item.image_url }} style={styles.petImage} />
                                <View style={styles.petInfo}>
                                    <Text style={styles.petName}>{item.name} ({item.species})</Text>
                                    <Text style={styles.petLocation}>📍 {item.location}</Text>
                                    <Text style={styles.petFee}>💰 Adoption Fee: ₹{item.adoption_fee || "Free"}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

// ✅ Updated Styles with `SafeAreaView` & `marginTop`
const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: "#f9f9f9",
    },
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        padding: 20,
        marginTop: 20, // ✅ Added margin to prevent collision with the status bar
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#777",
    },
    noPetsText: {
        textAlign: "center",
        fontSize: 16,
        color: "#777",
    },
    petCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 12,
        flexDirection: "row",
        padding: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    petImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 10,
    },
    petInfo: {
        flex: 1,
    },
    petName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    petLocation: {
        fontSize: 14,
        color: "#777",
    },
    petFee: {
        fontSize: 14,
        color: "#4CAF50",
        fontWeight: "bold",
    },
});

