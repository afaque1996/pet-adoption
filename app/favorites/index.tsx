import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    FlatList,
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image,
} from 'react-native';
import { supabase } from '../../supabaseConfig';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons'; // For icons

const FavoritesScreen = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('favorites')
                .select('*, pets(*)')
                .eq('user_id', user?.id);

            if (error) {
                console.error('Error fetching favorites:', error);
            } else {
                setFavorites(data || []);
            }
            setLoading(false);
        };

        if (user) {
            fetchFavorites();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (authLoading) {
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

    const renderItem = ({ item }: { item: any }) => {
        const pet = item.pets;
        if (!pet) return null;
        return (
            <TouchableOpacity
                style={styles.petCard}
                onPress={() => router.push(`/adoption/details?id=${pet.id}`)}
            >
                <Image source={{ uri: pet.image_url }} style={styles.petImage} />
                <View style={styles.petInfo}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petLocation}>📍 {pet.location}</Text>
                </View>
                <Feather name="heart" size={24} color="#ff6b6b" style={styles.favoriteIcon} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Favorites</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ff6b6b" />
                </View>
            ) : favorites.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="heart" size={50} color="#777" />
                    <Text style={styles.emptyText}>No favorites found.</Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    headerRight: {
        width: 24, // To balance the header layout
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#777',
        marginTop: 10,
    },
    listContent: {
        padding: 20,
    },
    petCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        alignItems: 'center',
        padding: 16,
        shadowColor: '#000',
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
        fontWeight: 'bold',
        color: '#333',
    },
    petLocation: {
        fontSize: 14,
        color: '#777',
        marginTop: 4,
    },
    favoriteIcon: {
        marginLeft: 10,
    },
});