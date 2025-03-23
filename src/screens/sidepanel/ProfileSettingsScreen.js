import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Animated,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { useTextStyle } from '../../hooks/useTextStyle';
import { useSettings } from '../../context/SettingsContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function ProfileSettingsScreen() {
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigation = useNavigation();
  const textStyle = useTextStyle();
  const { settings } = useSettings();

  const currentUser = auth.currentUser;

  // Fetch user data from Firestore
  const loadUserData = async () => {
    if (currentUser) {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setEmail(data.email || '');
          setAge(data.age || '');
          setLocation(data.location || '');
          setProfileImage(data.profileImage || null);
        } else {
          // No profile document found; you might choose to create one or use defaults
          setName('Enter your Name');
          setEmail(currentUser.email);
          setAge('');
          setLocation('');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load your profile data.");
      }
    }
  };

  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadUserData();

    // Request image picker permissions
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant camera roll permissions to change your profile picture.');
        }
      }
    })();

    // Fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (age && (isNaN(parseInt(age)) || parseInt(age) < 6 || parseInt(age) > 120)) {
      Alert.alert('Error', 'Please enter a valid age between 6 and 120');
      return;
    }

    setIsSaving(true);
    try {
      // Update the user's profile document in Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      await setDoc(userDocRef, {
        name: name.trim(),
        email: email.trim(),
        age: age.trim(),
        location: location.trim(),
        profileImage: profileImage || null
      }, { merge: true });  // merge ensures you don't overwrite the entire document

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
    setIsSaving(false);
  };

  const renderEditableField = (label, value, setValue, placeholder, keyboardType = 'default', multiline = false, icon) => (
    <Animated.View 
      style={[
        styles.fieldContainer, 
        { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0]
        })}] }
      ]}
    >
      <View style={styles.labelContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.fieldLabel, textStyle]}>{label}</Text>
      </View>
      {isEditing ? (
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.textInput, 
              multiline && styles.multilineInput,
              { fontSize: textStyle.fontSize, color: textStyle.color, fontFamily: textStyle.fontFamily }
            ]}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor="#999"
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
          />
        </View>
      ) : (
        <View style={styles.valueWrapper}>
          <Text 
            style={[
              styles.fieldValue, 
              textStyle
            ]}
          >
            {value || `No ${label.toLowerCase()} set`}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Orange theme gradient header */}
        <LinearGradient
          colors={['#FF9F9F', '#FF6B6B']}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={[styles.title, { color: '#fff', fontFamily: textStyle.fontFamily }]}>Profile</Text>
            <TouchableOpacity 
              style={[styles.editButton, isEditing && styles.saveButtonColor]} 
              onPress={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.editButtonText, { fontFamily: textStyle.fontFamily }]}>
                  {isEditing ? 'Save' : 'Edit'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Profile image centered in header */}
          <View style={styles.profileImageHeaderContainer}>
            <TouchableOpacity 
              activeOpacity={isEditing ? 0.7 : 1}
              onPress={isEditing ? pickImage : null} 
              disabled={!isEditing}
              style={styles.imageWrapper}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={60} color="#fff" />
                </View>
              )}
              {isEditing && (
                <BlurView intensity={80} tint="dark" style={styles.cameraBlurView}>
                  <Ionicons name="camera" size={22} color="#fff" />
                </BlurView>
              )}
            </TouchableOpacity>
            {!isEditing && (
              <Text style={[styles.displayName, textStyle, {color: '#fff'}]}>
                {name || 'Set your name'}
              </Text>
            )}
          </View>
        </LinearGradient>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[
            styles.card, 
            { opacity: fadeAnim }
          ]}>
            <View style={styles.formContainer}>
              {renderEditableField('Name', name, setName, 'Enter your full name', 'default', false, 
                <Ionicons name="person-outline" size={20} color="#FF6B6B" />
              )}
              
              {renderEditableField('Email', email, setEmail, 'Enter your email address', 'email-address', false, 
                <Ionicons name="mail-outline" size={20} color="#FF6B6B" />
              )}
              
              {renderEditableField('Age', age, setAge, 'Enter your age', 'numeric', false, 
                <Ionicons name="calendar-outline" size={20} color="#FF6B6B" />
              )}
              
              {renderEditableField('Location', location, setLocation, 'Enter your location', 'default', false, 
                <Ionicons name="location-outline" size={20} color="#FF6B6B" />
              )}
              
              {isEditing && (
                <TouchableOpacity 
                  style={[styles.saveButton, isSaving && styles.savingButton]} 
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={20} color="#fff" style={styles.saveIcon} />
                      <Text style={[styles.saveButtonText, { fontFamily: textStyle.fontFamily }]}>Save Changes</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  profileImageHeaderContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  scrollView: {
    flex: 1,
    marginTop: -60,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonColor: {
    backgroundColor: '#4caf50',
  },
  savingButton: {
    backgroundColor: '#9e9e9e',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  cameraBlurView: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
    padding: 20,
  },
  formContainer: {
    padding: 5,
  },
  fieldContainer: {
    marginBottom: 25,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 10,
    width: 24,
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  inputWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  valueWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  fieldValue: {
    fontSize: 16,
    color: '#444',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  textInput: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#333',
    width: '100%',
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveIcon: {
    marginRight: 8,
  }
});
