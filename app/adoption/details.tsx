import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../supabaseConfig";

export default function PetDetailsScreen() {
    const { id } = useLocalSearchParams(); // Get pet ID from the URL
    const router = useRouter();
    const [pet, setPet] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPetDetails = async () => {
            const { data, error } = await supabase.from("pets").select("*").eq("id", id).single();
            if (!error) setPet(data);
            setLoading(false);
        };
        if (id) fetchPetDetails();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff6b6b" />
                <Text style={styles.loadingText}>Loading pet details...</Text>
            </View>
        );
    }

    if (!pet) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ Pet not found!</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: pet.image_url }} style={styles.petImage} />

            <View style={styles.detailsContainer}>
                <Text style={styles.petName}>{pet.name} ({pet.species})</Text>
                <Text style={styles.petInfo}>🐾 Breed: {pet.breed}</Text>
                <Text style={styles.petInfo}>📍 Location: {pet.location}</Text>
                <Text style={styles.petInfo}>🎂 Age: {pet.age} years</Text>
                <Text style={styles.petInfo}>⚥ Gender: {pet.gender}</Text>
                <Text style={styles.petInfo}>💉 Vaccinated: {pet.vaccinated ? "Yes ✅" : "No ❌"}</Text>
                <Text style={styles.petInfo}>🩺 Health Status: {pet.health_status || "Unknown"}</Text>
                <Text style={styles.petInfo}>💰 Adoption Fee: ₹{pet.adoption_fee || "Free"}</Text>

                <Text style={styles.description}>{pet.description}</Text>

                <TouchableOpacity style={styles.contactButton} onPress={() => alert("Contacting adoption center...")}>
                    <Text style={styles.contactButtonText}>📞 Contact for Adoption</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>⬅️ Go Back</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// ✅ Styling for Pet Details Screen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
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
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        fontSize: 18,
        color: "#ff6b6b",
        fontWeight: "bold",
    },
    petImage: {
        width: "100%",
        height: 300,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    detailsContainer: {
        padding: 20,
    },
    petName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    petInfo: {
        fontSize: 16,
        color: "#555",
        marginBottom: 6,
    },
    description: {
        fontSize: 16,
        color: "#777",
        marginTop: 10,
        marginBottom: 20,
    },
    contactButton: {
        backgroundColor: "#ff6b6b",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 10,
    },
    contactButtonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
    },
    backButton: {
        backgroundColor: "#555",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    backButtonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
    },
});

