import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";
import * as FileSystem from "expo-file-system";

// Replace this with your actual API key
const GOOGLE_CLOUD_VISION_API_KEY = "AIzaSyBWPYuGOj4LKR4nxkmi00QT3ZTCwrTI_oE";

const TextToSpeechScreen = () => {
  const navigation = useNavigation();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  // Function to pick an image from camera
  const pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.uri);
      extractText(result.base64);
    }
  };

  // Function to extract text using Google Cloud Vision API
  const extractText = async (base64Image) => {
    try {
      const body = JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      });

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        }
      );

      const result = await response.json();
      const detectedText = result.responses[0]?.textAnnotations?.[0]?.description || "No text detected";

      setText(detectedText);
    } catch (error) {
      console.error("Error extracting text:", error);
      Alert.alert("Error", "Failed to extract text. Please try again.");
    }
  };

  // Function to read extracted text aloud
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
        <Text style={styles.buttonText}>Capture Document</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.preview} />}

      {text ? (
        <View style={styles.textContainer}>
          <Text style={styles.extractedText}>{text}</Text>
          <TouchableOpacity onPress={speakText} style={styles.button}>
            <Text style={styles.buttonText}>Read Aloud</Text>
          </TouchableOpacity>
        </View>
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
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 20,
  },
  textContainer: {
    alignItems: "center",
  },
  extractedText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
});

export default TextToSpeechScreen;
