import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
    const router = useRouter();

    // Toggle states
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkTheme, setDarkTheme] = useState(true);

    const toggleNotifications = () => {
        setNotificationsEnabled((prev) => !prev);
        // Update storage or backend if needed
    };

    const toggleDarkTheme = () => {
        setDarkTheme((prev) => !prev);
        // Dispatch theme update if using a global theme provider
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Settings</Text>
                </View>

                {/* Profile Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Profile</Text>
                    <TouchableOpacity
                        style={styles.sectionItem}
                        onPress={() => router.push('/settings/profile')}
                    >
                        <Text style={styles.itemText}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.sectionItem}
                        onPress={() => router.push('/settings/account')}
                    >
                        <Text style={styles.itemText}>Account Settings</Text>
                    </TouchableOpacity>
                </View>

                {/* Notifications Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <View style={styles.sectionItem}>
                        <Text style={styles.itemText}>Enable Notifications</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#666' }}
                            thumbColor={notificationsEnabled ? '#fff' : '#888'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleNotifications}
                            value={notificationsEnabled}
                        />
                    </View>
                </View>

                {/* Appearance Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Appearance</Text>
                    <View style={styles.sectionItem}>
                        <Text style={styles.itemText}>Dark Theme</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#666' }}
                            thumbColor={darkTheme ? '#fff' : '#888'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleDarkTheme}
                            value={darkTheme}
                        />
                    </View>
                </View>

                {/* Privacy & Data Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Privacy & Data</Text>
                    <TouchableOpacity style={styles.sectionItem}>
                        <Text style={styles.itemText}>Manage Data</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sectionItem}>
                        <Text style={styles.itemText}>Privacy Policy</Text>
                    </TouchableOpacity>
                </View>

                {/* About Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <TouchableOpacity style={styles.sectionItem}>
                        <Text style={styles.itemText}>App Version 1.0.0</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sectionItem}>
                        <Text style={styles.itemText}>Open Source Licenses</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={() => console.log('Perform logout')}
                    >
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
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
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    header: {
        paddingVertical: 24,
        backgroundColor: '#222',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
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
    sectionItem: {
        backgroundColor: '#333',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemText: {
        color: '#fff',
        fontSize: 16,
    },
    logoutContainer: {
        marginTop: 24,
        marginBottom: 32,
        alignItems: 'center',
    },
    logoutButton: {
        backgroundColor: '#f33',
        paddingVertical: 14,
        paddingHorizontal: 48,
        borderRadius: 8,
    },
    logoutText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});