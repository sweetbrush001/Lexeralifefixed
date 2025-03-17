import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { LinearGradient } from "expo-linear-gradient";

const OCR_API_KEY = "K87132275288957";

const TextToSpeechScreen = () => {
  const navigation = useNavigation();
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  
  const speechTimeouts = useRef([]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 10000, 
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    const unsubscribe = navigation.addListener("beforeRemove", () => {
      stopSpeech();
    });

    return unsubscribe;
  }, [navigation, isSpeaking]);

  const gradientColors = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      "rgba(255, 182, 193, 1)", 
      "rgba(173, 216, 230, 1)", 
      "rgba(221, 160, 221, 1)", 
    ],
  });

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture image.");
    }
  };

  const pickFromGallery = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image.");
    }
  };

  const processImage = async (imageUri) => {
    setLoading(true);
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      const base64Image = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      extractText(base64Image);
    } catch (error) {
      Alert.alert("Error", "Failed to process image.");
      setLoading(false);
    }
  };

  const extractText = async (base64Image) => {
    try {
      let formData = new FormData();
      formData.append("apikey", OCR_API_KEY);
      formData.append("base64image", `data:image/jpeg;base64,${base64Image}`);
      formData.append("language", "eng");

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = await response.json();
      if (result.ParsedResults && result.ParsedResults.length > 0) {
        setText(result.ParsedResults[0].ParsedText.trim() || "No text detected");
      } else {
        setText("No text detected. Try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to extract text.");
    } finally {
      setLoading(false);
    }
  };

  const speakTextWithHighlighting = () => {
    if (!text) {
      Alert.alert("No Text", "Please extract text first.");
      return;
    }

    if (isSpeaking) return;

    setIsSpeaking(true);
    setIsButtonDisabled(true);
    setHighlightedWordIndex(-1);

    const words = text.split(" ");
    
    words.forEach((word, index) => {
      const timeout = setTimeout(() => {
        setHighlightedWordIndex(index);
        Speech.speak(word, {
          rate: 1.5,
          onDone: () => {
            if (index === words.length - 1) {
              setIsSpeaking(false);
              setHighlightedWordIndex(-1);
              setIsButtonDisabled(false);
            }
          },
        });
      }, index * 500);

      speechTimeouts.current.push(timeout);
    });
  };

  const stopSpeech = () => {
    Speech.stop();
    setIsSpeaking(false);
    setHighlightedWordIndex(-1);
    setIsButtonDisabled(false);

    speechTimeouts.current.forEach(timeout => clearTimeout(timeout));
    speechTimeouts.current = [];
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animatedBackground, { backgroundColor: gradientColors }]} />

      <TouchableOpacity onPress={pickImage} style={styles.glowButton}>
        <LinearGradient colors={["#ff9966", "#ff5e62"]} style={styles.buttonInner}>
          <Text style={styles.buttonText}>📸 Capture Document</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={pickFromGallery} style={styles.glowButton}>
        <LinearGradient colors={["#56CCF2", "#2F80ED"]} style={styles.buttonInner}>
          <Text style={styles.buttonText}>🖼 Upload Image</Text>
        </LinearGradient>
      </TouchableOpacity>

      {!imageUri && !text && (
        <TouchableOpacity onPress={() => navigation.navigate("TypeTextScreen")} style={styles.glowButton}>
          <LinearGradient colors={["#00c6ff", "#0072ff"]} style={styles.buttonInner}>
            <Text style={styles.buttonText}>📝 Type a Text</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

      {loading && <ActivityIndicator size="large" color="#FF7043" />}

      {text ? (
        <ScrollView style={[styles.textContainer, isSpeaking && { transform: [{ scale: 1.1 }] }]}>
          <Text style={styles.extractedText}>
            {text.split(" ").map((word, index) => (
              <Text key={index} style={highlightedWordIndex === index ? styles.highlightedWord : {}}>
                {word}{" "}
              </Text>
            ))}
          </Text>

          <TouchableOpacity onPress={speakTextWithHighlighting} style={[styles.glowButton, styles.smallButton]} disabled={isButtonDisabled}>
            <LinearGradient colors={["#ff9966", "#ff5e62"]} style={styles.buttonInner}>
              <Text style={styles.buttonText}>🔊 Read the Text</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={stopSpeech} style={[styles.glowButton, styles.smallButton]}>
          <LinearGradient colors={["#ff9966", "#ff5e62"]} style={[styles.buttonInner, styles.smallButtonInner]}>
              <Text style={styles.buttonText}>⏹ Stop</Text>
            </LinearGradient>
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
    overflow: "hidden",
  },
  animatedBackground: {
    ...StyleSheet.absoluteFillObject,
    position: "absolute",
  },
  glowButton: {
    width: "90%",
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonContainer: {
    alignItems: 'center', 
    justifyContent: 'center',
    width: '100%', 
  },
  smallButton: {
    width: "60%",  
    marginVertical: 10, 
    alignSelf: 'center', 
  },
  smallButtonInner: {
    paddingVertical: 8,  
    borderRadius: 20,  
  },
  smallButtonText: {
    fontSize: 14,  
    textAlign: 'center',
  },  
  buttonInner: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  preview: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FF7043",
  },
  textContainer: {
    maxHeight: 300,
    width: "90%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#FF7043",
    borderRadius: 20,
    marginVertical: 10,
    backgroundColor: "#FFFAFA",
  },
  highlightedWord: {
    backgroundColor: "#FF7043",
    color: "#fff",
    padding: 2,
    borderRadius: 3,
  },
  smallerWord: {
    fontSize: 14, // Smaller font size for highlighted word
  },
  extractedText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
});

export default TextToSpeechScreen;
