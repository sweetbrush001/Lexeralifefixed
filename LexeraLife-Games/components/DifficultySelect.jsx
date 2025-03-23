"use client"

import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Animated, Dimensions } from "react-native"
import LottieView from "lottie-react-native"
import * as Haptics from "../utils/mock-haptics"
import { useRef, useEffect, useState } from "react"
import { Audio } from "expo-av"
import { getAudioFileUrl } from "../utils/supabaseService"

const { width, height } = Dimensions.get("window")

export default function DifficultySelect({ onSelectDifficulty, onBackToHome }) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const soundRef = useRef(null)
  const [soundLoaded, setSoundLoaded] = useState(false)
  const isMounted = useRef(true)
  const playWordAudio = async () => {
  if (!soundRef.current) return;

  try {
    await soundRef.current.setRateAsync(playbackRate, true);
    await soundRef.current.playFromPositionAsync(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.error("Error playing audio:", error);
  }
};
  // Set up animation and audio
  useEffect(() => {
    // Start animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Set up audio
    const setupAudio = async () => {
      try {
        // Configure audio mode first
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });

        // Fetch audio file URL from Supabase
        const audioUrl = await getAudioFileUrl("jungle-drums.mp3");
        if (!audioUrl) throw new Error("Audio URL is null or undefined");

        // Create and load the sound
        const soundObject = new Audio.Sound();
        await soundObject.loadAsync({ uri: audioUrl });
        await soundObject.setIsLoopingAsync(true);
        await soundObject.setVolumeAsync(0.5);

        // Only set state if component is still mounted
        if (isMounted.current) {
          soundRef.current = soundObject;
          setSoundLoaded(true);

          // Play the sound
          await soundObject.playAsync();
          console.log("Difficulty select sound loaded and playing");
        } else {
          // If component unmounted during setup, clean up immediately
          await soundObject.unloadAsync();
        }
      } catch (error) {
        console.error("Error setting up difficulty select sound:", error);
      }
    };

    setupAudio();

    // Cleanup function
    return () => {
      console.log("DifficultySelect unmounting, cleaning up resources");
      isMounted.current = false;

      if (soundRef.current) {
        const cleanup = async () => {
          try {
            const status = await soundRef.current.getStatusAsync();
            if (status.isLoaded) {
              try {
                await soundRef.current.stopAsync();
              } catch (stopError) {
                console.log("Error stopping sound during cleanup:", stopError);
              }
              try {
                await soundRef.current.unloadAsync();
              } catch (unloadError) {
                console.log("Error unloading sound during cleanup:", unloadError);
              }
              console.log("Difficulty select sound cleaned up successfully");
            }
          } catch (error) {
            if (error.message !== "Player does not exist.") {
              console.log("Error cleaning up difficulty select sound:", error);
            }
          } finally {
            soundRef.current = null;
          }
        };

        cleanup();
      } else {
        console.log("No sound to clean up during unmount");
      }
    };
  }, []);

  const handleSelect = (difficulty) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    // Stop sound before navigating
    const stopSound = async () => {
      if (soundRef.current && soundLoaded) {
        try {
          const status = await soundRef.current.getStatusAsync()
          if (status.isLoaded) {
            await soundRef.current.stopAsync()
          }
        } catch (error) {
          console.log("Error stopping sound on select:", error)
        }
      }

      // Navigate after attempting to stop sound
      onSelectDifficulty(difficulty)
    }

    stopSound()
  }

  const handleBackToHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    // Stop sound before navigating
    const stopSound = async () => {
      if (soundRef.current && soundLoaded) {
        try {
          const status = await soundRef.current.getStatusAsync()
          if (status.isLoaded) {
            await soundRef.current.stopAsync()
          }
        } catch (error) {
          console.log("Error stopping sound on back:", error)
        }
      }

      // Navigate after attempting to stop sound
      onBackToHome()
    }

    stopSound()
  }

  return (
    <ImageBackground
      source={require("../assets/images/jungle-background.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Choose Your Challenge</Text>

        <Animated.View style={[styles.buttonsContainer, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity style={styles.difficultyButton} onPress={() => handleSelect("easy")} activeOpacity={0.7}>
            <ImageBackground
              source={require("../assets/images/wooden-easy.png")}
              style={styles.woodenSign}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.difficultyButton}
            onPress={() => handleSelect("intermediate")}
            activeOpacity={0.7}
          >
            <ImageBackground
              source={require("../assets/images/wooden-medium.png")}
              style={styles.woodenSign}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.difficultyButton} onPress={() => handleSelect("hard")} activeOpacity={0.7}>
            <ImageBackground
              source={require("../assets/images/wooden-hard.png")}
              style={styles.woodenSign}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={styles.backButton} onPress={handleBackToHome} activeOpacity={0.7}>
          <ImageBackground
            source={require("../assets/images/wooden-button-small.png")}
            style={styles.woodenButtonSmall}
            resizeMode="stretch"
          >
            <Text style={styles.backButtonText}>Back to Menu</Text>
          </ImageBackground>
        </TouchableOpacity>

        <View style={styles.animationContainer}>
          <LottieView
            source={require("../assets/animations/smiling-owl.json")}
            autoPlay
            loop
            style={styles.animalsAnimation}
          />
        </View>
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
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  title: {
    fontSize: Math.min(width * 0.08, 28),
    fontFamily: "OpenDyslexic-Bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.85)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: height * 0.01,
    textAlign: "center",
  },
  buttonsContainer: {
    width: "100%",
    maxWidth: Math.min(width * 0.9, 500),
    alignItems: "center",
    gap: height * 0.001,
  },
  difficultyButton: {
    width: "80%",
    height: height * 0.11,
    alignItems: "center",
    justifyContent: "center",
  },
  woodenSign: {
    width: Math.min(width * 0.8, 200),
    height: Math.min(height * 0.15, 100),
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    width: Math.min(width * 0.6, 220),
    height: Math.min(height * 0.1, 100),
    marginTop: height * 0.05,
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
  animalsAnimation: {
    width: Math.min(width * 0.5, 200),
    height: Math.min(height * 0.3, 120),
    position: "absolute",
    top: height * 0,
    alignSelf: "center",
  },
});

