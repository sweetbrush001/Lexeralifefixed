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
      "rgba(255, 154, 158, 0.95)", // Warmer pink
      "rgba(250, 208, 196, 0.95)", // Soft peach
      "rgba(255, 154, 158, 0.95)", // Back to pink
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
      
      <View style={styles.cardContainer}>
        <Text style={styles.headerText}>Text to Speech</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={pickImage} style={styles.glowButton}>
            <LinearGradient colors={["#ff9966", "#ff5e62"]} style={styles.buttonInner}>
              <Text style={styles.buttonText}>📸 Capture</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickFromGallery} style={styles.glowButton}>
            <LinearGradient colors={["#ff9a9e", "#fad0c4"]} style={styles.buttonInner}>
              <Text style={styles.buttonText}>🖼 Gallery</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {!imageUri && !text && (
          <TouchableOpacity onPress={() => navigation.navigate("TypeTextScreen")} style={[styles.glowButton, styles.fullWidthButton]}>
            <LinearGradient colors={["#ff9a9e", "#fad0c4"]} style={styles.buttonInner}>
              <Text style={styles.buttonText}>📝 Type a Text</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.preview} />
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF7043" />
            <Text style={styles.loadingText}>Processing image...</Text>
          </View>
        )}

        {text ? (
          <View style={styles.resultCard}>
            <ScrollView style={styles.textContainer}>
              <Text style={styles.extractedText}>
                {text.split(" ").map((word, index) => (
                  <Text key={index} style={highlightedWordIndex === index ? styles.highlightedWord : {}}>
                    {word}{" "}
                  </Text>
                ))}
              </Text>
            </ScrollView>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                onPress={speakTextWithHighlighting} 
                style={[styles.actionButton, isButtonDisabled && styles.disabledButton]} 
                disabled={isButtonDisabled}
              >
                <LinearGradient colors={["#ff9966", "#ff5e62"]} style={styles.actionButtonInner}>
                  <Text style={styles.actionButtonText}>🔊 Read</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={stopSpeech} style={styles.actionButton}>
                <LinearGradient colors={["#ff5e62", "#d9534f"]} style={styles.actionButtonInner}>
                  <Text style={styles.actionButtonText}>⏹ Stop</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    overflow: "hidden",
  },
  animatedBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContainer: {
    width: '92%',
    borderRadius: 25,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff5e62',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  glowButton: {
    width: '48%',
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#ff9a9e",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  fullWidthButton: {
    width: '100%',
  },
  buttonInner: {
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 15,
  },
  preview: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#FF7043",
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#FF7043',
    fontSize: 16,
  },
  resultCard: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: "#FF7043",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  textContainer: {
    maxHeight: 200,
    width: "100%",
    padding: 15,
    borderRadius: 0,
    backgroundColor: "#FFFAFA",
  },
  extractedText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#333",
  },
  highlightedWord: {
    backgroundColor: "#FF7043",
    color: "#fff",
    padding: 2,
    borderRadius: 5,
    overflow: 'hidden',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'rgba(255, 250, 250, 0.8)',
  },
  actionButton: {
    width: '45%',
    borderRadius: 15,
    shadowColor: "#ff9a9e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  actionButtonInner: {
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default TextToSpeechScreen;
