import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { supabase } from '../supabaseConfig';

interface FavoriteButtonProps {
    petId: number;
    userId: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ petId, userId }) => {
    const [favorited, setFavorited] = useState(false);

    // Check if this pet is already favorited by the user
    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            const { data, error } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', userId)
                .eq('pet_id', petId)
                .single();

            if (!error && data) {
                setFavorited(true);
            }
        };

        fetchFavoriteStatus();
    }, [petId, userId]);

    // Toggle favorite status
    const toggleFavorite = async () => {
        if (favorited) {
            // Remove favorite record
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('pet_id', petId);
            if (!error) {
                setFavorited(false);
            }
        } else {
            // Insert a new favorite record
            const { error } = await supabase
                .from('favorites')
                .insert([{ user_id: userId, pet_id: petId }]);
            if (!error) {
                setFavorited(true);
            }
        }
    };

    return (
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
            <Text style={[styles.heart, favorited ? styles.heartActive : styles.heartInactive]}>
                {favorited ? '❤️' : '🤍'}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
    },
    heart: {
        fontSize: 24,
    },
    heartActive: {
        color: 'red',
    },
    heartInactive: {
        color: 'gray',
    },
});

export default FavoriteButton;
