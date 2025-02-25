import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../supabaseConfig";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function PetDetailsScreen() {
    const { id } = useLocalSearchParams();
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
                <Feather name="alert-circle" size={50} color="#ff6b6b" />
                <Text style={styles.errorText}>Pet not found!</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>⬅️ Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pet Details</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Pet Image with Gradient Overlay */}
            <View style={styles.imageContainer}>
                <Image source={{ uri: pet.image_url }} style={styles.petImage} />
                <LinearGradient
                    colors={["transparent", "rgba(0, 0, 0, 0.8)"]}
                    style={styles.gradientOverlay}
                />
            </View>

            {/* Pet Details */}
            <View style={styles.detailsContainer}>
                <Text style={styles.petName}>{pet.name} ({pet.species})</Text>
                <View style={styles.infoRow}>
                    <Feather name="tag" size={16} color="#555" />
                    <Text style={styles.petInfo}> Breed: {pet.breed}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Feather name="map-pin" size={16} color="#555" />
                    <Text style={styles.petInfo}> Location: {pet.location}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Feather name="calendar" size={16} color="#555" />
                    <Text style={styles.petInfo}> Age: {pet.age} years</Text>
                </View>
                <View style={styles.infoRow}>
                    <Feather name="user" size={16} color="#555" />
                    <Text style={styles.petInfo}> Gender: {pet.gender}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Feather name="shield" size={16} color="#555" />
                    <Text style={styles.petInfo}> Vaccinated: {pet.vaccinated ? "Yes ✅" : "No ❌"}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Feather name="heart" size={16} color="#555" />
                    <Text style={styles.petInfo}> Health Status: {pet.health_status || "Unknown"}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Feather name="dollar-sign" size={16} color="#555" />
                    <Text style={styles.petInfo}> Adoption Fee: ₹{pet.adoption_fee || "Free"}</Text>
                </View>

                <Text style={styles.description}>{pet.description}</Text>

                <TouchableOpacity style={styles.contactButton} onPress={() => alert("Contacting adoption center...")}>
                    <Feather name="phone" size={20} color="#fff" />
                    <Text style={styles.contactButtonText}> Contact for Adoption</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Feather name="arrow-left" size={20} color="#fff" />
                    <Text style={styles.backButtonText}> Go Back</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        backgroundColor: "#ff6b6b",
    },
    headerBackButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    headerRight: {
        width: 24, // To balance the header layout
    },
    imageContainer: {
        position: "relative",
    },
    petImage: {
        width: "100%",
        height: 300,
    },
    gradientOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 100,
    },
    detailsContainer: {
        padding: 20,
    },
    petName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    petInfo: {
        fontSize: 16,
        color: "#555",
        marginLeft: 8,
    },
    description: {
        fontSize: 16,
        color: "#777",
        marginTop: 16,
        marginBottom: 20,
        lineHeight: 24,
    },
    contactButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ff6b6b",
        padding: 14,
        borderRadius: 8,
        marginBottom: 10,
    },
    contactButtonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
        marginLeft: 8,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#555",
        padding: 12,
        borderRadius: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
        marginLeft: 8,
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
        marginTop: 10,
    },
});