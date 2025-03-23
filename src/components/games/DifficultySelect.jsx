"use client"

import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Animated, Dimensions } from "react-native"
import LottieView from "lottie-react-native"
import * as Haptics from "expo-haptics"
import { useRef, useEffect, useState } from "react"
import { Audio } from "expo-av"
import { getAudioFileUrl } from "../../utils/supabaseService"

const { width, height } = Dimensions.get("window")

export default function DifficultySelect({ onSelectDifficulty, onBackToHome }) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const soundRef = useRef(null)
  const [soundLoaded, setSoundLoaded] = useState(false)
  const isMounted = useRef(true)
  const [playbackRate, setPlaybackRate] = useState(1.0); // Add missing playbackRate state

  const playWordAudio = async () => {
    if (!soundRef.current) return;

    try {
      // Always give haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Safe audio playback
      if (typeof soundRef.current.getStatusAsync === 'function') {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          // Try to play the sound - handle missing methods
          if (typeof soundRef.current.setRateAsync === 'function') {
            await soundRef.current.setRateAsync(playbackRate, true);
          }
          if (typeof soundRef.current.playFromPositionAsync === 'function') {
            await soundRef.current.playFromPositionAsync(0);
          } else if (typeof soundRef.current.playAsync === 'function') {
            await soundRef.current.playAsync();
          }
        }
      }
    } catch (error) {
      console.error("Error playing audio, continuing:", error);
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
        if (!audioUrl) {
          console.log("Audio URL is null or undefined");
          return;
        }

        // Create and load sound in a single call for simplicity
        const { sound: soundObject } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          {
            isLooping: true,
            volume: 0.5,
            shouldPlay: true
          }
        );

        // Store reference safely
        if (isMounted.current) {
          soundRef.current = soundObject;
          setSoundLoaded(true);
          console.log("Difficulty select sound loaded and playing");
        } else {
          // Clean up if component unmounted
          if (typeof soundObject.unloadAsync === 'function') {
            soundObject.unloadAsync().catch(console.error);
          }
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
            if (typeof soundRef.current?.getStatusAsync === 'function') {
              try {
                const status = await soundRef.current.getStatusAsync();
                if (status.isLoaded) {
                  if (typeof soundRef.current.stopAsync === 'function') {
                    try {
                      await soundRef.current.stopAsync();
                    } catch (stopError) {
                      console.log("Error stopping sound, continuing cleanup:", stopError);
                    }
                  }
                  
                  if (typeof soundRef.current.unloadAsync === 'function') {
                    try {
                      await soundRef.current.unloadAsync();
                    } catch (unloadError) {
                      console.log("Error unloading sound, continuing cleanup:", unloadError);
                    }
                  }
                  console.log("Difficulty select sound cleaned up successfully");
                }
              } catch (error) {
                console.log("Error checking sound status, continuing cleanup:", error);
              }
            }
          } catch (error) {
            console.log("Cleanup error, continuing:", error);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Safely stop sound - don't wait for it to complete
    if (soundRef.current && soundLoaded) {
      (async () => {
        try {
          if (typeof soundRef.current.getStatusAsync === 'function') {
            const status = await soundRef.current.getStatusAsync();
            if (status.isLoaded && typeof soundRef.current.stopAsync === 'function') {
              await soundRef.current.stopAsync();
            }
          }
        } catch (error) {
          console.log("Error stopping sound, continuing with navigation:", error);
        }
      })();
    }

    // Always proceed with navigation
    onSelectDifficulty(difficulty);
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
      source={require("../../screens/games/assets/images/jungle-background.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Choose Your Challenge</Text>

        <Animated.View style={[styles.buttonsContainer, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity style={styles.difficultyButton} onPress={() => handleSelect("easy")} activeOpacity={0.7}>
            <ImageBackground
              source={require("../../screens/games/assets/images/wooden-easy.png")}
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
              source={require("../../screens/games/assets/images/wooden-medium.png")}
              style={styles.woodenSign}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.difficultyButton} onPress={() => handleSelect("hard")} activeOpacity={0.7}>
            <ImageBackground
              source={require("../../screens/games/assets/images/wooden-hard.png")}
              style={styles.woodenSign}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={styles.backButton} onPress={handleBackToHome} activeOpacity={0.7}>
          <ImageBackground
            source={require("../../screens/games/assets/images/wooden-button-small.png")}
            style={styles.woodenButtonSmall}
            resizeMode="stretch"
          >
            <Text style={styles.backButtonText}>Back to Menu</Text>
          </ImageBackground>
        </TouchableOpacity>

        <View style={styles.animationContainer}>
          <LottieView
            source={require("../../screens/games/assets/animations/smiling-owl.json")}
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
    width: "100%",
    height: Math.min(height * 0.3, 150),
    position: "absolute",
    top: 70,
  },
})

