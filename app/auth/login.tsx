import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { supabase } from "../../supabaseConfig";
import { useRouter } from "expo-router";

export default function LoginScreen() {
    const router = useRouter();
    const [method, setMethod] = useState<"email" | "phone">("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [confirmOtp, setConfirmOtp] = useState(false);

    // Helper function to create a default profile record on signup
    const createProfileOnSignup = async (userId: string) => {
        const defaultProfile = {
            id: userId,           // Use the same id as in auth.users
            name: "",
            bio: "",
            avatar_url: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from("profiles")
            .insert(defaultProfile);

        if (error) {
            console.error("Error creating profile:", error);
        } else {
            console.log("Profile created:", data);
        }
    };

    // 🔹 Handle Email Login
    const signInWithEmail = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);

        if (error) Alert.alert("Login Failed", error.message);
        else router.replace("/"); // Redirect to Home
    };

    // 🔹 Handle Email SignUp with automatic profile creation
    const signUpWithEmail = async () => {
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            setLoading(false);
            Alert.alert("Signup Failed", error.message);
        } else {
            // If a user record was created, create a default profile row
            if (data.user) {
                console.log("User signed up, creating profile for user:", data.user.id);
                await createProfileOnSignup(data.user.id);
            }
            setLoading(false);
            Alert.alert("Check your email", "A confirmation email has been sent!");
        }
    };

    // 🔹 Handle Phone OTP Request
    const sendOtp = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ phone });
        setLoading(false);

        if (error) Alert.alert("OTP Failed", error.message);
        else {
            setConfirmOtp(true);
            Alert.alert("OTP Sent!", "Check your phone for the OTP.");
        }
    };

    // 🔹 Handle Phone OTP Verification
    const verifyOtp = async () => {
        setLoading(true);
        const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
        setLoading(false);

        if (error) Alert.alert("OTP Verification Failed", error.message);
        else router.replace("/");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🐾 Welcome to Pet Adoption</Text>

            {/* 🔹 Toggle Between Email & Phone */}
            <View style={styles.switchContainer}>
                <TouchableOpacity
                    style={[styles.switchButton, method === "email" && styles.activeSwitch]}
                    onPress={() => setMethod("email")}
                >
                    <Text style={styles.switchText}>Login with Email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.switchButton, method === "phone" && styles.activeSwitch]}
                    onPress={() => setMethod("phone")}
                >
                    <Text style={styles.switchText}>Login with Phone</Text>
                </TouchableOpacity>
            </View>

            {/* 🔹 Email Login Form */}
            {method === "email" && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={setEmail}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#999"
                        secureTextEntry
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity style={styles.button} onPress={signInWithEmail} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.signupButton]} onPress={signUpWithEmail} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? "Signing up..." : "Sign Up"}</Text>
                    </TouchableOpacity>
                </>
            )}

            {/* 🔹 Phone Login Form */}
            {method === "phone" && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your phone number"
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                        onChangeText={setPhone}
                    />

                    <TouchableOpacity style={styles.button} onPress={sendOtp} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? "Sending OTP..." : "Send OTP"}</Text>
                    </TouchableOpacity>

                    {confirmOtp && (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter OTP"
                                placeholderTextColor="#999"
                                keyboardType="number-pad"
                                onChangeText={setOtp}
                            />
                            <TouchableOpacity style={styles.button} onPress={verifyOtp} disabled={loading}>
                                <Text style={styles.buttonText}>{loading ? "Verifying OTP..." : "Verify OTP"}</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </>
            )}
        </View>
    );
}

// ✅ Styled Components
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
    },
    switchContainer: {
        flexDirection: "row",
        marginBottom: 20,
        backgroundColor: "#ddd",
        borderRadius: 8,
        padding: 4,
    },
    switchButton: {
        flex: 1,
        padding: 10,
        alignItems: "center",
        borderRadius: 8,
    },
    activeSwitch: {
        backgroundColor: "#ff6b6b",
    },
    switchText: {
        color: "#fff",
        fontWeight: "bold",
    },
    input: {
        width: "100%",
        padding: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: "#fff",
        fontSize: 16,
    },
    button: {
        width: "100%",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: "#ff6b6b",
        marginBottom: 10,
    },
    signupButton: {
        backgroundColor: "#4CAF50",
    },
    buttonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
    },
});

