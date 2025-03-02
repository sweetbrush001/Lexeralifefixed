import React, { useState } from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, ScrollView 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator"; // For image resizing

const OCR_API_KEY = "K87132275288957"; // Replace with your actual OCR.space API Key

const TextToSpeechScreen = () => {
  const navigation = useNavigation();
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📸 Capture Image from Camera
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        base64: false,
        quality: 1, // High-quality image
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to capture image.");
    }
  };

  // 📂 Resize & Convert Image to Base64
  const processImage = async (imageUri) => {
    setLoading(true);
    try {
      // Resize and compress image before processing (fix file size issue)
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }], // Resize width to 800px
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress image
      );

      const base64Image = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      extractText(base64Image);
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert("Error", "Failed to process image.");
      setLoading(false);
    }
  };

  // 🔍 Extract Text using OCR API
  const extractText = async (base64Image) => {
    try {
      let formData = new FormData();
      formData.append("apikey", OCR_API_KEY);
      formData.append("base64image", `data:image/jpeg;base64,${base64Image}`);
      formData.append("language", "eng");
      formData.append("isOverlayRequired", "true"); // Improves OCR accuracy

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = await response.json();
      console.log("OCR API Response:", result); // Debugging

      if (result.ParsedResults && result.ParsedResults.length > 0) {
        setText(result.ParsedResults[0].ParsedText.trim() || "No text detected");
      } else {
        setText("No text detected. Try again with a clearer image.");
      }
    } catch (error) {
      console.error("Error extracting text:", error);
      Alert.alert("Error", "Failed to extract text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔊 Read Extracted Text
  const speakText = () => {
    if (text) {
      Speech.speak(text);
    } else {
      Alert.alert("No Text", "Please extract text first.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>📸 Capture Document</Text>
      </TouchableOpacity>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

      {loading && <ActivityIndicator size="large" color="#FF9999" />}

      {text ? (
        <ScrollView style={styles.textContainer}>
          <Text style={styles.extractedText}>{text}</Text>
          <TouchableOpacity onPress={speakText} style={styles.button}>
            <Text style={styles.buttonText}>🔊 Read Aloud</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  button: {
    backgroundColor: "#FF9999",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  preview: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    marginBottom: 20,
  },
  textContainer: {
    maxHeight: 300,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginVertical: 10,
  },
  extractedText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
});

export default TextToSpeechScreen;
