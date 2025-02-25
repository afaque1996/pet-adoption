import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
    SafeAreaView,
    ActivityIndicator,
    Keyboard,
} from "react-native";
import { supabase } from "../../supabaseConfig";
import { useRouter } from "expo-router";

const speciesList = ["Dog", "Cat", "Bird", "Rabbit", "Hamster", "Turtle"];
const breedOptions: { [key: string]: string[] } = {
    Dog: ["Labrador", "Beagle", "Bulldog", "Poodle"],
    Cat: ["Siamese", "Persian", "Maine Coon"],
    Bird: ["Parrot", "Canary", "Cockatiel"],
    Rabbit: ["Holland Lop", "Dutch", "Mini Rex"],
    Hamster: ["Syrian", "Dwarf", "Chinese"],
    Turtle: ["Box Turtle", "Red-Eared Slider"],
};

const SearchScreen = () => {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [filterSpecies, setFilterSpecies] = useState("");
    const [filterBreed, setFilterBreed] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    const fetchResults = async () => {
        setLoading(true);
        let queryBuilder = supabase.from("pets").select("*");

        if (query) {
            queryBuilder = queryBuilder.ilike("name", `%${query}%`);
        }
        if (filterSpecies) {
            queryBuilder = queryBuilder.eq("species", filterSpecies);
        }
        if (filterBreed) {
            queryBuilder = queryBuilder.eq("breed", filterBreed);
        }
        queryBuilder = queryBuilder.order("created_at", { ascending: false }).limit(20);
        const { data, error } = await queryBuilder;
        if (!error) setResults(data || []);
        setLoading(false);
    };

    const handleSearch = () => {
        fetchResults();
        if (query && !recentSearches.includes(query)) {
            setRecentSearches((prev) => [query, ...prev]);
        }
        Keyboard.dismiss();
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search pets by name..."
                    value={query}
                    onChangeText={setQuery}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                    <Text style={styles.searchBtnText}>Search</Text>
                </TouchableOpacity>
            </View>

            {/* Species Filters */}
            <View style={styles.filterContainer}>
                <FlatList
                    data={speciesList}
                    horizontal
                    keyExtractor={(item) => item}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                filterSpecies === item && styles.filterButtonActive,
                            ]}
                            onPress={() => {
                                setFilterSpecies(filterSpecies === item ? "" : item);
                                setFilterBreed(""); // reset breed when species changes
                            }}
                        >
                            <Text
                                style={[
                                    styles.filterButtonText,
                                    filterSpecies === item && styles.filterButtonTextActive,
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
                <View style={styles.recentSearchContainer}>
                    <Text style={styles.recentSearchTitle}>Recent Searches</Text>
                    {recentSearches.map((search, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                setQuery(search);
                                handleSearch();
                            }}
                        >
                            <Text style={styles.recentSearchItem}>{search}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultCard}
            onPress={() => router.push(`/adoption/details?id=${item.id}`)}
        >
            <Image source={{ uri: item.image_url }} style={styles.resultImage} />
            <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultLocation}>📍 {item.location}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeContainer}>
            <FlatList
                data={results}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator size="large" color="#ff6b6b" style={{ marginTop: 20 }} />
                    ) : (
                        <Text style={styles.noResults}>No results found.</Text>
                    )
                }
                contentContainerStyle={styles.listContentContainer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: "#f9f9f9",
    },
    headerContainer: {
        padding: 20,
        backgroundColor: "#fff",
    },
    searchBarContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginRight: 10,
    },
    searchBtn: {
        backgroundColor: "#ff6b6b",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    searchBtnText: {
        color: "#fff",
        fontWeight: "bold",
    },
    filterContainer: {
        marginBottom: 10,
    },
    filterButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: "#ddd",
        marginRight: 10,
    },
    filterButtonActive: {
        backgroundColor: "#ff6b6b",
    },
    filterButtonText: {
        color: "#333",
        fontWeight: "bold",
    },
    filterButtonTextActive: {
        color: "#fff",
    },
    recentSearchContainer: {
        marginTop: 10,
    },
    recentSearchTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    recentSearchItem: {
        fontSize: 14,
        color: "#555",
        paddingVertical: 5,
    },
    resultCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 10,
        marginHorizontal: 20,
        marginVertical: 8,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    resultImage: {
        width: 100,
        height: 100,
    },
    resultInfo: {
        flex: 1,
        padding: 10,
        justifyContent: "center",
    },
    resultName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    resultLocation: {
        fontSize: 14,
        color: "#777",
    },
    noResults: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
        color: "#777",
    },
    listContentContainer: {
        paddingBottom: 20,
    },
});

export default SearchScreen;
