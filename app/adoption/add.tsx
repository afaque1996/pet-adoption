import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; // For reading image as base64
import { supabase } from '../../supabaseConfig';
import { Feather } from '@expo/vector-icons'; // For icons

const speciesOptions = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Turtle'];
const breedOptions: { [key: string]: string[] } = {
  Dog: ['Labrador', 'Beagle', 'Bulldog', 'Poodle'],
  Cat: ['Siamese', 'Persian', 'Maine Coon'],
  Bird: ['Parrot', 'Canary', 'Cockatiel'],
  Rabbit: ['Holland Lop', 'Dutch', 'Mini Rex'],
  Hamster: ['Syrian', 'Dwarf', 'Chinese'],
  Turtle: ['Box Turtle', 'Red-Eared Slider'],
};

const healthStatusOptions = ['Healthy', 'Needs Attention', 'Recovering'];
const genderOptions = ['Male', 'Female']; // Add allowed gender values here

const AddPetScreen = () => {
  // Core fields
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [location, setLocation] = useState('');

  // Advanced fields (initially hidden)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const [description, setDescription] = useState('');

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Function to pick an image using Expo's ImagePicker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log('Image Picker Result:', result);

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    } else {
      console.log('User canceled image selection.');
    }
  };

  // Upload image to Cloudinary
  interface UploadImageResponse {
    secure_url: string;
  }

  const uploadImage = async (imageUri: string): Promise<string | null> => {
    try {
      const cloudName = 'dnjaidxgs';
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const formData = new FormData();
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });
      formData.append('file', `data:image/jpeg;base64,${base64Image}`);
      formData.append('upload_preset', 'ml_default');

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const result: UploadImageResponse = await response.json();

      if (!result.secure_url) {
        throw new Error('Failed to upload image to Cloudinary.');
      }

      return result.secure_url;
    } catch (error) {
      console.error('Upload Image Error:', error);
      return null;
    }
  };

  // Save the pet listing
  const handleSubmit = async () => {
    if (!name || !species || !location || !imageUri) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }

    setLoading(true);

    try {
      const uploadedImageUrl = await uploadImage(imageUri);
      if (!uploadedImageUrl) {
        throw new Error('Failed to upload image.');
      }

      console.log('Inserting pet to Supabase:', {
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

      const { error } = await supabase.from('pets').insert([
        {
          name,
          species,
          location,
          image_url: uploadedImageUrl,
          breed: breed || null,
          age: age ? parseInt(age) : null,
          gender: gender || null, // Ensure gender is one of the allowed values
          description: description || null,
          health_status: healthStatus || null,
          vaccinated: false,
          adoption_fee: 0.0,
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      Alert.alert('Success', 'Pet listed successfully!');
      // Reset form after successful submission
      setName('');
      setSpecies('');
      setImageUri('');
      setLocation('');
      setBreed('');
      setAge('');
      setGender('');
      setHealthStatus('');
      setDescription('');
    } catch (error) {
      console.error('Submit Error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Live preview card
  const renderPreview = () => (
    <View style={styles.previewCard}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
      ) : (
        <View style={[styles.previewImage, styles.previewPlaceholder]}>
          <Text style={styles.previewPlaceholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.previewInfo}>
        <Text style={styles.previewTitle}>{name || 'Pet Name'}</Text>
        <Text style={styles.previewSubtitle}>
          {species || 'Species'} - {location || 'Location'}
        </Text>
        {showAdvanced && (
          <Text style={styles.previewDetails}>
            {breed ? `Breed: ${breed}` : ''} {age ? `| Age: ${age}` : ''}{' '}
            {gender ? `| Gender: ${gender}` : ''}{' '}
            {healthStatus ? `| Health: ${healthStatus}` : ''}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.title}>List Your Pet</Text>

        {/* Core Fields */}
        <TextInput
          style={styles.input}
          placeholder="Pet Name *"
          value={name}
          onChangeText={setName}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Text style={styles.label}>Species *</Text>
        <View style={styles.pickerContainer}>
          {speciesOptions.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.optionButton,
                species === opt && styles.optionButtonActive,
              ]}
              onPress={() => {
                setSpecies(opt);
                setBreed('');
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  species === opt && styles.optionTextActive,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.species && <Text style={styles.errorText}>{errors.species}</Text>}

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.imagePickerText}>Upload Image *</Text>
          )}
        </TouchableOpacity>
        {errors.imageUri && <Text style={styles.errorText}>{errors.imageUri}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Location *"
          value={location}
          onChangeText={setLocation}
        />
        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

        {/* Toggle for advanced details */}
        <TouchableOpacity
          style={styles.toggleAdvanced}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={styles.toggleAdvancedText}>
            {showAdvanced ? 'Hide Advanced Details' : 'Show Advanced Details'}
          </Text>
        </TouchableOpacity>

        {showAdvanced && (
          <>
            <Text style={styles.label}>Breed</Text>
            {species && breedOptions[species] ? (
              <View style={styles.pickerContainer}>
                {breedOptions[species].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.optionButton,
                      breed === opt && styles.optionButtonActive,
                    ]}
                    onPress={() => setBreed(opt)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        breed === opt && styles.optionTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Breed"
                value={breed}
                onChangeText={setBreed}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Age (Years)"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              {genderOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.optionButton,
                    gender === opt && styles.optionButtonActive,
                  ]}
                  onPress={() => setGender(opt)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      gender === opt && styles.optionTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Health Status</Text>
            <View style={styles.pickerContainer}>
              {healthStatusOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.optionButton,
                    healthStatus === opt && styles.optionButtonActive,
                  ]}
                  onPress={() => setHealthStatus(opt)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      healthStatus === opt && styles.optionTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Description"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </>
        )}

        {/* Live Preview */}
        <Text style={styles.previewHeader}>Live Preview</Text>
        {renderPreview()}

        {/* Submission Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit Listing</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Save Draft</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddPetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  optionButtonActive: {
    backgroundColor: '#ff6b6b',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextActive: {
    color: '#fff',
  },
  imagePicker: {
    backgroundColor: '#ddd',
    borderRadius: 8,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#555',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  toggleAdvanced: {
    alignSelf: 'center',
    marginVertical: 10,
  },
  toggleAdvancedText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  previewCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  previewPlaceholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholderText: {
    color: '#aaa',
  },
  previewInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewSubtitle: {
    fontSize: 14,
    color: '#777',
    marginVertical: 4,
  },
  previewDetails: {
    fontSize: 12,
    color: '#555',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});