import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    SafeAreaView,
    Platform,
    Modal
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { supabase } from "../../supabaseConfig";
import { useRouter } from "expo-router";

// A reusable dropdown component that renders a modal for iOS
interface DropdownPickerProps {
    label: string;
    selectedValue: string;
    onValueChange: (value: string) => void;
    options: string[];
    enabled?: boolean;
}

const DropdownPicker: React.FC<DropdownPickerProps> = ({
    label,
    selectedValue,
    onValueChange,
    options,
    enabled = true,
}) => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleSelect = (value: string): void => {
        onValueChange(value);
    };

    if (Platform.OS === "ios") {
        return (
            <View style={{ marginBottom: 12 }}>
                <TouchableOpacity
                    style={[styles.dropdownButton, !enabled && { backgroundColor: "#eee" }]}
                    onPress={() => enabled && setModalVisible(true)}
                    disabled={!enabled}
                >
                    <Text style={[styles.dropdownButtonText, !enabled && { color: "#aaa" }]}>
                        {selectedValue || label}
                    </Text>
                </TouchableOpacity>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Picker
                                selectedValue={selectedValue}
                                onValueChange={(value) => handleSelect(value)}
                                // Ensure picker items are styled for visibility
                                itemStyle={styles.pickerItem}
                            >
                                <Picker.Item label={label} value="" />
                                {options.map((option) => (
                                    <Picker.Item key={option} label={option} value={option} />
                                ))}
                            </Picker>
                            <TouchableOpacity
                                style={styles.doneButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.doneButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    // Android: render the standard picker
    return (
        <View style={styles.pickerWrapper}>
            <Picker
                selectedValue={selectedValue}
                onValueChange={onValueChange}
                style={styles.picker}
                enabled={enabled}
            >
                <Picker.Item label={label} value="" />
                {options.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                ))}
            </Picker>
        </View>
    );
};

const ListPetScreen = () => {
    const router = useRouter();
    const [name, setName] = useState("");
    const [species, setSpecies] = useState<keyof typeof breedOptions | "">("");
    const [breed, setBreed] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [healthStatus, setHealthStatus] = useState("");
    const [imageUri, setImageUri] = useState("");
    const [loading, setLoading] = useState(false);

    const speciesList = ["Dog", "Cat", "Bird", "Rabbit", "Hamster", "Turtle"];
    const breedOptions = {
        Dog: ["Labrador", "Beagle", "Bulldog", "Poodle"],
        Cat: ["Siamese", "Persian", "Maine Coon"],
        Bird: ["Parrot", "Canary", "Cockatiel"],
        Rabbit: ["Holland Lop", "Dutch", "Mini Rex"],
        Hamster: ["Syrian", "Dwarf", "Chinese"],
        Turtle: ["Box Turtle", "Red-Eared Slider"],
    };
    const genderOptions = ["Male", "Female"];
    const healthStatusOptions = [
        "Healthy",
        "Needs Medical Attention",
        "Recovering",
        "Special Needs"
    ];

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log("Image Picker Result:", result);

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        } else {
            console.log("User canceled image selection.");
        }
    };

    interface UploadImageResponse {
        secure_url: string;
    }

    const uploadImage = async (imageUri: string): Promise<string | null> => {
        try {
            const cloudName = "dnjaidxgs";
            const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
            const formData = new FormData();
            const base64Image = await FileSystem.readAsStringAsync(imageUri, {
                encoding: "base64",
            });
            formData.append("file", `data:image/jpeg;base64,${base64Image}`);
            formData.append("upload_preset", "ml_default");

            const response = await fetch(uploadUrl, {
                method: "POST",
                body: formData,
            });

            const result: UploadImageResponse = await response.json();

            if (!result.secure_url) {
                throw new Error("Failed to upload image to Cloudinary.");
            }

            return result.secure_url;
        } catch (error) {
            console.error("Upload Image Error:", error);
            return null;
        }
    };

    const handleSubmit = async () => {
        if (!name || !species || !location || !imageUri) {
            Alert.alert("Error", "Please fill out all required fields.");
            return;
        }

        setLoading(true);

        try {
            const uploadedImageUrl = await uploadImage(imageUri);
            if (!uploadedImageUrl) {
                throw new Error("Failed to upload image.");
            }
            console.log("Inserting pet to Supabase:", {
                name,
                species,
                location,
                image_url: uploadedImageUrl,
                breed,
                age,
                gender,
                description,
                healthStatus,
            });

            const { data, error } = await supabase.from("pets").insert([
                {
                    name,
                    species,
                    location,
                    image_url: uploadedImageUrl,
                    breed: breed || null,
                    age: age ? parseInt(age) : null,
                    gender: gender || null,
                    description: description || null,
                    health_status: healthStatus || null,
                    vaccinated: false,
                    adoption_fee: 0.0,
                },
            ]);

            if (error) {
                throw new Error(error.message);
            }

            Alert.alert("Success", "Pet listed successfully!");
            router.replace("/home");
        } catch (error) {
            console.error("Submit Error:", error);
            Alert.alert("Error", error instanceof Error ? error.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>📋 List a Pet for Adoption</Text>

                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.petImage} />
                    ) : (
                        <Text>📸 Upload Pet Image</Text>
                    )}
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    placeholder="Pet Name"
                    onChangeText={setName}
                />

                <DropdownPicker
                    label="Select Species"
                    selectedValue={species}
                    onValueChange={(value) => {
                        setSpecies(value as keyof typeof breedOptions);
                        setBreed("");
                    }}
                    options={speciesList}
                />

                <DropdownPicker
                    label="Select Breed"
                    selectedValue={breed}
                    onValueChange={setBreed}
                    options={species && species in breedOptions ? breedOptions[species] : []}
                    enabled={!!species}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Age (Years)"
                    keyboardType="numeric"
                    onChangeText={setAge}
                />

                <DropdownPicker
                    label="Select Gender"
                    selectedValue={gender}
                    onValueChange={setGender}
                    options={genderOptions}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Location"
                    onChangeText={setLocation}
                />

                <TextInput
                    style={styles.textArea}
                    placeholder="Description"
                    multiline
                    onChangeText={setDescription}
                />

                <DropdownPicker
                    label="Select Health Status"
                    selectedValue={healthStatus}
                    onValueChange={setHealthStatus}
                    options={healthStatusOptions}
                />

                <View style={{ flex: 1 }}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? "Submitting..." : "List Pet"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>⬅️ Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
    scrollContainer: { flexGrow: 1, padding: 20 },
    title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
    imagePicker: {
        width: "100%",
        height: 150,
        backgroundColor: "#ddd",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        marginBottom: 15
    },
    petImage: { width: "100%", height: 150, borderRadius: 10 },
    input: {
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: "#fff"
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: "#fff",
        overflow: "hidden"
    },
    picker: { height: 50, width: "100%" },
    textArea: {
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: "#fff",
        height: 100,
        textAlignVertical: "top"
    },
    button: {
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: "#ff6b6b",
        marginBottom: 12
    },
    buttonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold"
    },
    backButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: "#555"
    },
    backButtonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold"
    },
    dropdownButton: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    dropdownButtonText: {
        fontSize: 16,
        color: "#333",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        paddingTop: 10,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        height: 250, // Adjust this height as needed for a proper display
    },
    pickerItem: {
        fontSize: 18,
        color: "#333",
        textAlign: "center",
    },
    doneButton: {
        padding: 12,
        alignItems: "center",
        borderTopWidth: 1,
        borderColor: "#ddd",
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#ff6b6b",
    },
});

export default ListPetScreen;
