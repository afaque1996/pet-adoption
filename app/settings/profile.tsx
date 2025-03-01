import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabaseConfig';
import { useAuth } from '../../hooks/useAuth';
import { Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth(); // Auth hook provides the user and loading state
    interface Profile {
        id: string;
        name: string;
        bio: string;
        avatar_url: string;
    }

    const [profile, setProfile] = useState<Profile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    // Fetch profile details from Supabase profiles table
    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (error) {
                    console.error('Error fetching profile:', error);
                } else {
                    setProfile(data);
                }
                setProfileLoading(false);
            };

            fetchProfile();
        }
    }, [user]);

    if (authLoading || profileLoading) {
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

    // Use fetched profile details or fallback to defaults
    const displayName = profile?.name || user.email.split('@')[0];
    const bio = profile?.bio || 'Your bio goes here. Edit your profile to add more details.';
    const profilePicture = profile?.avatar_url || 'https://via.placeholder.com/150';

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            router.push('/auth/login');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <Image source={{ uri: profilePicture }} style={styles.profileImage} />
                    <Text style={styles.profileName}>{displayName}</Text>
                    <Text style={styles.profileEmail}>{user.email}</Text>
                </View>

                {/* Bio Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>About Me</Text>
                    <Text style={styles.bioText}>{bio}</Text>
                </View>

                {/* Edit Profile Button */}
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push('/profile/edit')}
                >
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>

                {/* Additional Options */}
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => router.push('/settings/change-password')}
                    >
                        <Text style={styles.optionText}>Change Password</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => router.push('/settings/privacy')}
                    >
                        <Text style={styles.optionText}>Privacy Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => router.push('/settings/connected-apps')}
                    >
                        <Text style={styles.optionText}>Connected Apps</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.editButton} onPress={handleLogout}>
                    <Text style={styles.editButtonText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000', // Dark background for dark mode
    },
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#666',
    },
    profileName: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 16,
        color: '#888',
    },
    sectionContainer: {
        marginBottom: 16,
        backgroundColor: '#222',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 12,
    },
    bioText: {
        fontSize: 16,
        color: '#fff',
        lineHeight: 24,
    },
    editButton: {
        backgroundColor: '#666',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    optionItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    optionText: {
        fontSize: 16,
        color: '#fff',
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
});
