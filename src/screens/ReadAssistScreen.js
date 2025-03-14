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
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { useTextStyle } from "../hooks/useTextStyle"; // Import the text style hook

const OCR_API_KEY = "K87132275288957";
const { width } = Dimensions.get("window");

const ReadAssistScreen = () => {
  const navigation = useNavigation();
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); 
  
  // Get text style from the hook (we'll only use fontFamily from it)
  const textStyle = useTextStyle();
  
  // Font loading hook
  const [fontsLoaded] = useFonts({

    'OpenDyslexic-Regular': require('../../assets/fonts/OpenDyslexic3-Regular.ttf'),
  });

  const speechTimeouts = useRef([]);
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 10000, 
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // Stop speech when navigating away from the page
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (isSpeaking) {
        Speech.stop();
        setIsSpeaking(false);
        speechTimeouts.current.forEach(timeout => clearTimeout(timeout));
        speechTimeouts.current = [];
      }
    });

    return unsubscribe;
  }, [navigation, isSpeaking]);

  // Handle button press animation
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const gradientColors = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      "rgba(255, 182, 193, 0.9)", 
      "rgba(173, 216, 230, 0.9)", 
      "rgba(221, 160, 221, 0.9)", 
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

    // Prevent multiple clicks if already speaking
    if (isSpeaking) return;

    animateButton();
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

  // Handle loading state for fonts
  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#FF7043" />;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animatedBackground, { backgroundColor: gradientColors }]} />

      <Text style={[styles.headerText, { fontFamily: textStyle.fontFamily || 'OpenSans-Bold' }]}>Read Assist</Text>

      <Animated.View style={{transform: [{scale: buttonScale}]}}>
        <TouchableOpacity 
          onPress={() => {
            animateButton();
            pickImage();
          }} 
          style={styles.glowButton}
        >
          <LinearGradient 
            colors={["#ff9966", "#ff5e62"]} 
            style={styles.buttonInner} 
            start={{x: 0, y: 0}} 
            end={{x: 1, y: 0}}
          >
            <Text style={[styles.buttonText, { fontFamily: textStyle.fontFamily || 'OpenSans-Bold' }]}>📸 Capture Document</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{transform: [{scale: buttonScale}]}}>
        <TouchableOpacity 
          onPress={() => {
            animateButton();
            pickFromGallery();
          }} 
          style={styles.glowButton}
        >
          <LinearGradient 
            colors={["#56CCF2", "#2F80ED"]} 
            style={styles.buttonInner} 
            start={{x: 0, y: 0}} 
            end={{x: 1, y: 0}}
          >
            <Text style={[styles.buttonText, { fontFamily: textStyle.fontFamily || 'OpenSans-Bold' }]}>🖼 Upload Image</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{transform: [{scale: buttonScale}]}}>
        <TouchableOpacity 
          onPress={() => {
            animateButton();
            navigation.navigate("TypeTextScreen");
          }} 
          style={styles.glowButton}
        >
          <LinearGradient 
            colors={["#00c6ff", "#0072ff"]} 
            style={styles.buttonInner} 
            start={{x: 0, y: 0}} 
            end={{x: 1, y: 0}}
          >
            <Text style={[styles.buttonText, { fontFamily: textStyle.fontFamily || 'OpenSans-Bold' }]}>📝 Type a Text</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {imageUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7043" />
          <Text style={[styles.loadingText, { fontFamily: textStyle.fontFamily || 'OpenSans-Regular' }]}>Processing text...</Text>
        </View>
      )}

      {text ? (
        <Animated.View style={[styles.textContainerWrapper, isSpeaking && { transform: [{ scale: 1.05 }] }]}>
          <ScrollView style={styles.textContainer} showsVerticalScrollIndicator={false}>
            <Text style={[styles.extractedText, { fontFamily: textStyle.fontFamily || 'Merriweather-Regular' }]}>
              {text.split(" ").map((word, index) => (
                <Text
                  key={index}
                  style={[
                    styles.wordStyle,
                    { fontFamily: textStyle.fontFamily || 'Merriweather-Regular' },
                    highlightedWordIndex === index ? [styles.highlightedWord, 
                      { fontFamily: textStyle.fontFamily || 'OpenSans-Bold' }] : {},
                  ]}
                >
                  {word}{" "}
                </Text>
              ))}
            </Text>
          </ScrollView>
          
          <Animated.View style={{transform: [{scale: buttonScale}], marginTop: 15}}>
            <TouchableOpacity 
              onPress={() => {
                animateButton();
                speakTextWithHighlighting();
              }} 
              style={styles.glowButton} 
              disabled={isButtonDisabled}
            >
              <LinearGradient 
                colors={isButtonDisabled ? ["#cccccc", "#999999"] : ["#ff9966", "#ff5e62"]} 
                style={styles.buttonInner} 
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 0}}
              >
                <Text style={[styles.buttonText, { fontFamily: textStyle.fontFamily || 'OpenSans-Bold' }]}>
                  {isSpeaking ? "🔊 Reading..." : "🔊 Read the Text"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
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
  headerText: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 25,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  animatedBackground: {
    ...StyleSheet.absoluteFillObject,
    position: "absolute",
  },
  glowButton: {
    width: width * 0.85,
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonInner: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  previewContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    marginBottom: 20,
  },
  preview: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FF7043",
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  textContainerWrapper: {
    width: "95%",
    maxHeight: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 15,
    marginTop: 10,
  },
  textContainer: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#FF7043",
    borderRadius: 20,
    backgroundColor: "rgba(255, 250, 250, 0.95)",
  },
  highlightedWord: {
    backgroundColor: "#FF7043",
    color: "#fff",
    padding: 3,
    borderRadius: 4,
    overflow: 'hidden',
    fontSize: 18,
  },
  wordStyle: {
    fontSize: 16,
  },
  extractedText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#333",
  },
});

export default ReadAssistScreen;