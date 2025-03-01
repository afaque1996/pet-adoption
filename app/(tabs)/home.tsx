import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../supabaseConfig';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';

export default function HomeScreen() {
    const router = useRouter();

    // State for data categories
    const [urgentPets, setUrgentPets] = useState<any[]>([]);
    const [trendingPets, setTrendingPets] = useState<any[]>([]);
    const [newArrivals, setNewArrivals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Urgent carousel index and fade shared value
    const [urgentIndex, setUrgentIndex] = useState(0);
    const fade = useSharedValue(1);

    // Helper function to get pet image or generate a dynamic placeholder with species and breed
    const getPetImageUrl = (pet: any) => {
        let imageUrl = pet.image_url;
        if (!imageUrl || imageUrl.trim() === '') {
            const species = pet.species || 'Unknown Species';
            const breed = pet.breed || '';
            const placeholderText = breed ? `${species} - ${breed}` : species;
            return `https://placehold.co/300x200?text=${encodeURIComponent(placeholderText)}`;
        }
        return imageUrl;
    };

    // Fetch data from Supabase
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Urgent Care / Special Needs
            const { data: urgentData, error: urgentError } = await supabase
                .from('pets')
                .select('*')
                .eq('special_needs', true)
                .order('created_at', { ascending: false })
                .limit(10);
            if (urgentError) console.error('Urgent Pets Error:', urgentError);
            else setUrgentPets(urgentData || []);

            // Trending (assuming favorites_count exists)
            const { data: trendingData, error: trendingError } = await supabase
                .from('pets')
                .select('*')
                .order('favorites_count', { ascending: false })
                .limit(10);
            if (trendingError) console.error('Trending Pets Error:', trendingError);
            else setTrendingPets(trendingData || []);

            // New Arrivals
            const { data: newData, error: newError } = await supabase
                .from('pets')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);
            if (newError) console.error('New Arrivals Error:', newError);
            else setNewArrivals(newData || []);

            setLoading(false);
        };

        fetchData();
    }, []);

    // Animate the urgent carousel using Reanimated
    useEffect(() => {
        if (urgentPets.length > 1) {
            const interval = setInterval(() => {
                // Fade out current card
                fade.value = withTiming(0, { duration: 500 }, () => {
                    // Once faded out, update index on JS thread
                    runOnJS(setUrgentIndex)((prev) => (prev + 1) % urgentPets.length);
                    // Fade in new card
                    fade.value = withTiming(1, { duration: 500 });
                });
            }, 4000); // change every 4 seconds
            return () => clearInterval(interval);
        }
    }, [urgentPets, fade]);

    // Animated style for urgent card
    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: fade.value,
        };
    });

    // Manual navigation for urgent carousel
    const handlePrev = () => {
        fade.value = 1;
        setUrgentIndex((prev) => (prev - 1 + urgentPets.length) % urgentPets.length);
    };

    const handleNext = () => {
        fade.value = 1;
        setUrgentIndex((prev) => (prev + 1) % urgentPets.length);
    };

    // Render a single urgent card with animated style
    const renderUrgentCard = () => {
        if (!urgentPets.length) {
            return (
                <View style={styles.urgentCard}>
                    <Text style={styles.emptyText}>No urgent care pets found.</Text>
                </View>
            );
        }
        const pet = urgentPets[urgentIndex];
        if (!pet) {
            return (
                <View style={styles.urgentCard}>
                    <Text style={styles.emptyText}>No urgent care pet available.</Text>
                </View>
            );
        }
        const imageUrl = getPetImageUrl(pet);
        return (
            <Animated.View style={[styles.urgentCard, animatedStyle]}>
                <TouchableOpacity
                    onPress={() => router.push(`/adoption/details?id=${pet.id}`)}
                    activeOpacity={0.8}
                >
                    <Image source={{ uri: imageUrl }} style={styles.urgentCardImage} />
                    <View style={styles.urgentCardInfo}>
                        <Text style={styles.urgentCardName}>{pet.name}</Text>
                        <Text style={styles.urgentCardLocation}>📍 {pet.location}</Text>
                    </View>
                </TouchableOpacity>
                {/* Prev/Next navigation buttons */}
                <View style={styles.navButtons}>
                    <TouchableOpacity style={styles.navButton} onPress={handlePrev}>
                        <Text style={styles.navButtonText}>Prev</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navButton} onPress={handleNext}>
                        <Text style={styles.navButtonText}>Next</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    // Reusable pet card for trending section
    const renderPetCard = ({ item }: { item: any }) => {
        const imageUrl = getPetImageUrl(item);
        return (
            <TouchableOpacity
                style={styles.petCard}
                onPress={() => router.push(`/adoption/details?id=${item.id}`)}
            >
                <Image source={{ uri: imageUrl }} style={styles.petImage} />
                <Text style={styles.petName}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ActivityIndicator size="large" color="#fff" style={styles.loading} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Image
                        source={{ uri: 'https://www.placecats.com/50/50' }}
                        style={styles.avatar}
                    />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.mainTitle}>Find your new friend</Text>
                        <Text style={styles.subTitle}>Discover Pets near you</Text>
                    </View>
                </View>

                {/* Latest Arrivals Carousel Card */}
                <View style={styles.arrivalsCard}>
                    <Text style={styles.arrivalsTitle}>Check out the latest arrivals</Text>
                    <Text style={styles.arrivalsSubtitle}>Explore different breeds and ages</Text>
                    {newArrivals.length === 0 ? (
                        <Text style={styles.emptyText}>No new arrivals yet.</Text>
                    ) : (
                        <FlatList
                            horizontal
                            data={newArrivals}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.arrivalCarouselCard}
                                    onPress={() => router.push(`/adoption/details?id=${item.id}`)}
                                >
                                    <Image
                                        source={{ uri: getPetImageUrl(item) }}
                                        style={styles.arrivalImage}
                                    />
                                    <Text style={styles.arrivalName}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.id.toString()}
                            showsHorizontalScrollIndicator={false}
                            pagingEnabled
                        />
                    )}
                </View>

                {/* Search Button */}
                <TouchableOpacity style={styles.searchButton}>
                    <Text style={styles.searchButtonText}>Search for Pets</Text>
                </TouchableOpacity>

                {/* Urgent Care Carousel */}
                <Text style={styles.sectionTitle}>Urgent Care / Special Needs</Text>
                {renderUrgentCard()}

                {/* Trending Section */}
                <Text style={styles.sectionTitle}>Trending</Text>
                {trendingPets.length === 0 ? (
                    <Text style={styles.emptyText}>No trending pets found.</Text>
                ) : (
                    <FlatList
                        horizontal
                        data={trendingPets}
                        renderItem={renderPetCard}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.horizontalList}
                        showsHorizontalScrollIndicator={false}
                    />
                )}

                {/* Category Options */}
                <View style={styles.categoryContainer}>
                    <Text style={styles.categoryTitle}>Categories</Text>
                    <View style={styles.categoryOptions}>
                        {["Dogs", "Cats", "Rabbits", "Others"].map((category) => (
                            <TouchableOpacity
                                key={category}
                                style={styles.categoryButton}
                                onPress={() => console.log(category)}
                            >
                                <Text style={styles.categoryButtonText}>{category}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        marginTop: 20,
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    headerTextContainer: {
        marginLeft: 12,
    },
    mainTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    subTitle: {
        fontSize: 16,
        color: '#bbb',
        marginTop: 4,
    },
    arrivalsCard: {
        backgroundColor: '#333',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    arrivalsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    arrivalsSubtitle: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 12,
    },
    arrivalCarouselCard: {
        width: 200,
        backgroundColor: '#444',
        borderRadius: 12,
        padding: 10,
        marginRight: 16,
        alignItems: 'center',
    },
    arrivalImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 8,
    },
    arrivalName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    searchButton: {
        alignSelf: 'flex-end',
        backgroundColor: '#fff',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    searchButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        marginBottom: 20,
    },
    horizontalList: {
        paddingBottom: 20,
    },
    // Urgent carousel styles
    urgentCard: {
        backgroundColor: '#222',
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        marginBottom: 24,
    },
    urgentCardImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 8,
    },
    urgentCardInfo: {
        alignItems: 'center',
        marginBottom: 8,
    },
    urgentCardName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    urgentCardLocation: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 4,
    },
    navButtons: {
        flexDirection: 'row',
        marginTop: 4,
    },
    navButton: {
        backgroundColor: '#555',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 6,
    },
    navButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    // Trending/New Arrivals pet card styles
    petCard: {
        width: 100,
        backgroundColor: '#222',
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        marginRight: 16,
    },
    petImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginBottom: 8,
    },
    petName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    // Loading indicator style
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Category options styling
    categoryContainer: {
        marginTop: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#222',
        borderRadius: 12,
        marginBottom: 20,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    categoryOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    categoryButton: {
        backgroundColor: '#555',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    categoryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
