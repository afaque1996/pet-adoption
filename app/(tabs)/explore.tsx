import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    Image,
    ActivityIndicator,
} from 'react-native';
import { supabase } from '../../supabaseConfig'; // or wherever your config is
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
    const router = useRouter();

    // Data state
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [sortOption, setSortOption] = useState<'Newest' | 'Popular'>('Newest');
    const [selectedSpecies, setSelectedSpecies] = useState('All');
    const [breedQuery, setBreedQuery] = useState('');

    // Species options to display
    const speciesOptions = ['All', 'Cats', 'Dogs', 'Rabbits', 'Others'];

    // Sort options to display
    const sortOptions = ['Newest', 'Popular'];

    // Fetch all pets with the selected filters
    const fetchPets = async () => {
        setLoading(true);

        // Start building the query
        let query = supabase.from('pets').select('*');

        // Filter by species (if not "All")
        if (selectedSpecies !== 'All') {
            // Example: the DB might store species as 'cat', 'dog', etc.
            // Make sure you match the case or do a .ilike for partial matches
            query = query.eq('species', selectedSpecies.toLowerCase());
        }

        // Filter by breed (partial match)
        if (breedQuery.trim() !== '') {
            // .ilike is a case-insensitive pattern match in Supabase
            query = query.ilike('breed', `%${breedQuery.trim()}%`);
        }

        // Sorting
        if (sortOption === 'Newest') {
            query = query.order('created_at', { ascending: false });
        } else if (sortOption === 'Popular') {
            // This assumes you have a 'favorites_count' or similar popularity column
            query = query.order('favorites_count', { ascending: false });
        }

        // Execute query
        const { data, error } = await query;
        if (error) {
            console.error('Fetch pets error:', error);
            setPets([]);
        } else {
            setPets(data || []);
        }
        setLoading(false);
    };

    // Refetch whenever filters change
    useEffect(() => {
        fetchPets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortOption, selectedSpecies, breedQuery]);

    // Render each pet in a grid cell
    const renderPetItem = ({ item }: { item: any }) => {
        // Fallback image if missing
        const imageUrl =
            item.image_url && item.image_url.trim() !== ''
                ? item.image_url
                : 'https://placehold.co/200x200?text=No+Image';

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

    // Render species filter buttons
    const renderSpeciesFilters = () => {
        return (
            <View style={styles.filterRow}>
                {speciesOptions.map((species) => (
                    <TouchableOpacity
                        key={species}
                        style={[
                            styles.filterButton,
                            selectedSpecies === species && styles.filterButtonActive,
                        ]}
                        onPress={() => setSelectedSpecies(species)}
                    >
                        <Text style={styles.filterButtonText}>{species}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    // Render sort options
    const renderSortFilters = () => {
        return (
            <View style={styles.filterRow}>
                {sortOptions.map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.filterButton,
                            sortOption === option && styles.filterButtonActive,
                        ]}
                        onPress={() => setSortOption(option as 'Newest' | 'Popular')}
                    >
                        <Text style={styles.filterButtonText}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header / Title */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Explore</Text>
            </View>

            {/* Filter Section */}
            <View style={styles.filterContainer}>
                {/* Species Filter */}
                <Text style={styles.filterLabel}>Species</Text>
                {renderSpeciesFilters()}

                {/* Sort Filter */}
                <Text style={styles.filterLabel}>Sort By</Text>
                {renderSortFilters()}

                {/* Breed Filter (Text Input) */}
                <Text style={styles.filterLabel}>Breed</Text>
                <TextInput
                    style={styles.breedInput}
                    placeholder="Type breed (e.g. Siamese)"
                    placeholderTextColor="#888"
                    value={breedQuery}
                    onChangeText={setBreedQuery}
                />
            </View>

            {/* Main Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            ) : pets.length === 0 ? (
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No pets found for these filters.</Text>
                </View>
            ) : (
                <FlatList
                    data={pets}
                    renderItem={renderPetItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2} // Grid layout
                    contentContainerStyle={styles.petList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    filterContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    filterLabel: {
        color: '#fff',
        fontSize: 16,
        marginTop: 10,
        marginBottom: 4,
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    filterButton: {
        backgroundColor: '#222',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    filterButtonActive: {
        backgroundColor: '#555',
    },
    filterButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    breedInput: {
        backgroundColor: '#222',
        color: '#fff',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        color: '#888',
        fontSize: 16,
    },
    petList: {
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: 80, // extra space at bottom
    },
    petCard: {
        flex: 1,
        backgroundColor: '#222',
        borderRadius: 12,
        margin: 8,
        padding: 8,
        alignItems: 'center',
    },
    petImage: {
        width: '100%',
        height: 100,
        borderRadius: 8,
        marginBottom: 8,
        resizeMode: 'cover',
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
        marginTop: 2,
    },
});
