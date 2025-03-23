"use client"

import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Animated, Dimensions } from "react-native"
import LottieView from "lottie-react-native"
import * as Haptics from "expo-haptics"
import { useRef, useEffect, useState } from "react"
import { Audio } from "expo-av"

const { width, height } = Dimensions.get("window")

export default function PhonicsDifficultySelect({ onSelectDifficulty, onBackToHome = () => {} }) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const soundRef = useRef(null)
  const [soundLoaded, setSoundLoaded] = useState(false)
  const isMounted = useRef(true)
  const [animationLoaded, setAnimationLoaded] = useState(true)

  // Set up animation and audio
  useEffect(() => {
    // Start animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Simplified audio setup
    const setupAudio = async () => {
      try {
        // Configure audio mode first
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // Create and load the sound with options in one call
        const { sound } = await Audio.Sound.createAsync(
          require("./assets/sounds/ocean-ambience.mp3"),
          { 
            isLooping: true,
            volume: 0.5,
            shouldPlay: true 
          }
        );

        // Only set state if component is still mounted
        if (isMounted.current) {
          soundRef.current = sound;
          setSoundLoaded(true);
          console.log("Difficulty select sound loaded successfully");
        } else {
          // Clean up immediately if unmounted
          sound.unloadAsync().catch(console.error);
        }
      } catch (error) {
        console.error("Error setting up difficulty select sound:", error);
      }
    };

    setupAudio();

    // Cleanup function
    return () => {
      console.log("PhonicsDifficultySelect unmounting, cleaning up resources")
      isMounted.current = false

      // Clean up sound
      if (soundRef.current) {
        const cleanup = async () => {
          try {
            const status = await soundRef.current.getStatusAsync()
            if (status.isLoaded) {
              await soundRef.current.stopAsync()
              await soundRef.current.unloadAsync()
              console.log("Difficulty select sound cleaned up successfully")
            }
          } catch (error) {
            console.log("Error cleaning up difficulty select sound:", error)
          } finally {
            soundRef.current = null
          }
        }

        cleanup()
      }
    }
  }, [])

  // Try to load animation
  useEffect(() => {
    try {
      // Verify animation file exists
      require("./assets/animations/loading.json")
    } catch (error) {
      console.error("Error loading animation:", error)
      setAnimationLoaded(false)
    }
  }, [])

  const handleSelect = (difficulty) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simplified sound stopping
    try {
      if (soundRef.current && soundLoaded) {
        soundRef.current.stopAsync().catch(error => {
          console.log("Error stopping sound on select:", error);
        });
      }
    } catch (error) {
      console.log("Error handling difficulty selection:", error);
    }

    // Navigate regardless of sound stop success
    onSelectDifficulty(difficulty);
  };

  const handleBackToHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simplified sound stopping
    try {
      if (soundRef.current && soundLoaded) {
        soundRef.current.stopAsync().catch(error => {
          console.log("Error stopping sound on back:", error);
        });
      }
    } catch (error) {
      console.log("Error handling back to home:", error);
    }

    // Only call if it's a function
    if (typeof onBackToHome === 'function') {
      onBackToHome();
    } else {
      console.warn("onBackToHome is not a function");
    }
  };

  return (
    <ImageBackground
      source={require("./assets/images/treasure.webp")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Choose Yer Challenge</Text>

        <Animated.View style={[styles.buttonsContainer, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity style={styles.difficultyButton} onPress={() => handleSelect("easy")} activeOpacity={0.7}>
            <ImageBackground
              source={require("./assets/images/logo.png")}
              style={styles.woodenSign}
              resizeMode="contain"
            >
              <Text style={styles.buttonText}>Cabin Boy</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity style={styles.difficultyButton} onPress={() => handleSelect("medium")} activeOpacity={0.7}>
            <ImageBackground
              source={require("./assets/images/logo.png")}
              style={styles.woodenSign}
              resizeMode="contain"
            >
              <Text style={styles.buttonText}>First Mate</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity style={styles.difficultyButton} onPress={() => handleSelect("hard")} activeOpacity={0.7}>
            <ImageBackground
              source={require("./assets/images/logo.png")}
              style={styles.woodenSign}
              resizeMode="contain"
            >
              <Text style={styles.buttonText}>Captain</Text>
            </ImageBackground>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={styles.backButton} onPress={handleBackToHome} activeOpacity={0.7}>
          <ImageBackground
            source={require("./assets/images/wooden-button-small.png")}
            style={styles.woodenButtonSmall}
            resizeMode="stretch"
          >
            <Text style={styles.backButtonText}>Back to Port</Text>
          </ImageBackground>
        </TouchableOpacity>

        {animationLoaded && (
          <View style={styles.animationContainer}>
            <LottieView
              source={require("./assets/animations/loading.json")}
              autoPlay
              loop
              style={styles.shipAnimation}
            />
          </View>
        )}
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: Math.min(width * 0.08, 42),
    fontFamily: "OpenDyslexic-Bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.85)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: height * 0.05,
    textAlign: "center",
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: height * 0.05,
  },
  difficultyButton: {
    width: width * 0.7,
    height: height * 0.1,
    marginBottom: height * 0.02,
    alignItems: "center",
    justifyContent: "center",
  },
  woodenSign: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: Math.min(width * 0.06, 28),
    fontFamily: "OpenDyslexic-Bold",
    color: "#3E2723",
    textAlign: "center",
  },
  backButton: {
    width: width * 0.5,
    height: height * 0.06,
    marginBottom: height * 0.05,
  },
  woodenButtonSmall: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: Math.min(width * 0.04, 18),
    fontFamily: "OpenDyslexic-Bold",
    color: "#3E2723",
    textAlign: "center",
  },
  animationContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: height * 0.2,
    alignItems: "center",
  },
  shipAnimation: {
    width: width * 0.8,
    height: height * 0.2,
  },
})

