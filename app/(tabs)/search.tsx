import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabaseConfig'; // or wherever your config is

export default function SearchScreen() {
    const router = useRouter();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Nearby and recommended data
    const [nearbyPets, setNearbyPets] = useState<any[]>([]);
    const [recommendedPets, setRecommendedPets] = useState<any[]>([]);

    // Example: fetch recommended or nearby pets from Supabase (or any other logic)
    useEffect(() => {
        // You might have geolocation logic or user preference data to pass as filters
        const fetchData = async () => {
            // Example: recommended pets
            const { data: recommendedData, error: recommendedError } = await supabase
                .from('pets')
                .select('*')
                .limit(5);

            if (recommendedError) {
                console.error('Recommended fetch error:', recommendedError);
            } else if (recommendedData) {
                setRecommendedPets(recommendedData);
            }

            // Example: nearby pets (you might filter by user location, zip code, etc.)
            const { data: nearbyData, error: nearbyError } = await supabase
                .from('pets')
                .select('*')
                .limit(5);

            if (nearbyError) {
                console.error('Nearby fetch error:', nearbyError);
            } else if (nearbyData) {
                setNearbyPets(nearbyData);
            }
        };

        fetchData();
    }, []);

    // Handle search logic
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        // 1) Save search query in "recent searches"
        setRecentSearches((prev) => {
            // Avoid duplicates; put the new query at the front
            const newList = [searchQuery, ...prev.filter((item) => item !== searchQuery)];
            // Optionally limit how many you store
            return newList.slice(0, 5);
        });

        // 2) Navigate to a results page or filter results here
        // For example:
        router.push(`/search/results?query=${searchQuery.trim()}`);

        // 3) Clear the text input (optional)
        setSearchQuery('');
    };

    // Render a single recent search
    const renderRecentSearchItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={styles.recentSearchItem}
            onPress={() => {
                // Re-trigger the search with this query
                setSearchQuery(item);
                router.push(`/search/results?query=${item}`);
            }}
        >
            <Text style={styles.recentSearchText}>{item}</Text>
        </TouchableOpacity>
    );

    // Render a single pet card
    const renderPetCard = ({ item }: { item: any }) => {
        // Fallback image if missing
        const imageUrl =
            item.image_url && item.image_url.trim() !== ''
                ? item.image_url
                : 'https://placehold.co/100x100?text=No+Image';

        return (
            <TouchableOpacity
                style={styles.petCard}
                onPress={() => router.push(`/adoption/details?id=${item.id}`)}
            >
                <Image source={{ uri: imageUrl }} style={styles.petImage} />
                <View style={styles.petInfo}>
                    <Text style={styles.petName}>{item.name}</Text>
                    <Text style={styles.petLocation}>📍 {item.location}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header / Title */}
                <Text style={styles.headerTitle}>Search</Text>

                {/* Search Input */}
                <View style={styles.searchBar}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Find your new furry friend"
                        placeholderTextColor="#888"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Text style={styles.searchButtonText}>Go</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                    <View style={styles.recentSearchesContainer}>
                        <View style={styles.recentHeader}>
                            <Text style={styles.sectionTitle}>Browse recent searches</Text>
                            <TouchableOpacity onPress={() => setRecentSearches([])}>
                                <Text style={styles.clearText}>Clear all</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={recentSearches}
                            renderItem={renderRecentSearchItem}
                            keyExtractor={(item, index) => `recent-${index}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.recentList}
                        />
                    </View>
                )}

                {/* Nearby Pets */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Nearby</Text>
                    {nearbyPets.length === 0 ? (
                        <Text style={styles.emptyText}>No nearby pets found.</Text>
                    ) : (
                        <FlatList
                            data={nearbyPets}
                            renderItem={renderPetCard}
                            keyExtractor={(item) => item.id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.petList}
                        />
                    )}
                </View>

                {/* Recommended For You */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Recommended for you</Text>
                    {recommendedPets.length === 0 ? (
                        <Text style={styles.emptyText}>No recommended pets yet.</Text>
                    ) : (
                        <FlatList
                            data={recommendedPets}
                            renderItem={renderPetCard}
                            keyExtractor={(item) => item.id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.petList}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ----------------------------------------
// STYLES
// ----------------------------------------
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    headerTitle: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 16,
    },
    // Search bar
    searchBar: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#222',
        color: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginRight: 10,
    },
    searchButton: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    searchButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    // Recent Searches
    recentSearchesContainer: {
        marginBottom: 20,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    clearText: {
        color: '#bbb',
        fontSize: 14,
    },
    recentList: {
        paddingVertical: 4,
    },
    recentSearchItem: {
        backgroundColor: '#333',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 8,
    },
    recentSearchText: {
        color: '#fff',
    },
    // Nearby / Recommended sections
    sectionContainer: {
        marginBottom: 24,
    },
    emptyText: {
        color: '#888',
        fontSize: 14,
        marginTop: 6,
    },
    petList: {
        paddingVertical: 8,
    },
    petCard: {
        width: 120,
        backgroundColor: '#222',
        borderRadius: 12,
        padding: 8,
        marginRight: 12,
        alignItems: 'center',
    },
    petImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginBottom: 8,
    },
    petInfo: {
        alignItems: 'center',
    },
    petName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    petLocation: {
        fontSize: 12,
        color: '#bbb',
    },
});
