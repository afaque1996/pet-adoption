import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabaseConfig';
import { useAuth } from '../../hooks/useAuth';
import uploadImage from '../../services/uploadImage';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Fetch current profile details from the "profiles" table
    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                const { data, error }: { data: any; error: any } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (error) {
                    console.error('Error fetching profile:', error);
                } else if (data) {
                    setName(data.name || '');
                    setBio(data.bio || '');
                    setAvatarUrl(data.avatar_url || '');
                }
                setLoading(false);
            };
            fetchProfile();
        }
    }, [user]);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.status !== 'granted') {
            Alert.alert('Permission Required', 'Permission to access the gallery is needed!');
            return;
        }
        // Launch the image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            handleImageUpload(result.assets[0].uri);
        }
    };

    interface UploadImageResult {
        url: string;
        error: Error | null;
    }

    const handleImageUpload = async (uri: string) => {
        try {
            setUploading(true);
            const result: string | null = await uploadImage(uri);
            if (!result) {
                throw new Error('Failed to upload image to Cloudinary.');
            }
            setAvatarUrl(result);
        } catch (err: any) {
            Alert.alert('Upload Error', err.message || 'Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };


    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Name cannot be empty.');
            return;
        }
        setUpdating(true);

        // Build the object including the user's id, which is needed for the primary key
        const updates = {
            id: user.id, // This is critical so that upsert knows which record to update or insert
            name: name.trim(),
            bio: bio.trim(),
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
        };

        console.log('Attempting to upsert profile for user:', user.id);
        console.log('Upsert object:', updates);

        const { data, error }: { data: any; error: any } = await supabase
            .from('profiles')
            .upsert(updates); // returns the updated/inserted record

        console.log('Supabase upsert response:', { data, error });

        if (error) {
            console.error('Error upserting profile:', error);
            Alert.alert('Update Error', error.message);
        } else {
            if (!data || data.length === 0) {
                console.warn('Upsert succeeded but no data was returned.');
            } else {
                console.log('Profile successfully updated/upserted:', data);
            }
            Alert.alert('Success', 'Profile updated successfully');
            router.back();
        }
        setUpdating(false);
    };



    if (authLoading || loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#ff6b6b" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Edit Profile</Text>
            </View>
            <View style={styles.form}>
                {/* Avatar Preview and Upload */}
                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={{ uri: avatarUrl || 'https://via.placeholder.com/150' }}
                            style={styles.avatar}
                        />
                        {uploading && (
                            <View style={styles.uploadOverlay}>
                                <ActivityIndicator size="small" color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.changePhotoText}>Change Photo</Text>
                </View>
                <Text style={styles.label}>Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="#888"
                    value={name}
                    onChangeText={setName}
                />
                <Text style={styles.label}>Bio</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter your bio"
                    placeholderTextColor="#888"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                />
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={updating}
                >
                    <Text style={styles.saveButtonText}>
                        {updating ? 'Saving...' : 'Save Changes'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 16,
    },
    header: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    form: {
        marginTop: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#666',
    },
    uploadOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 120,
        height: 120,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changePhotoText: {
        marginTop: 8,
        fontSize: 16,
        color: '#fff',
    },
    label: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#222',
        color: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#666',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

