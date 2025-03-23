"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Animated, Dimensions } from "react-native"
import { Audio } from "expo-av"
import LottieView from "lottie-react-native"
import * as Haptics from "expo-haptics"
import { getAudioFileUrl } from "../../utils/supabaseService"

const { width, height } = Dimensions.get("window")

// Add a default value for onBackToHome
export default function SplashScreen({ onStartGame, onBackToHome = () => {} }) {
  const [soundLoaded, setSoundLoaded] = useState(false)
  const soundRef = useRef(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    loadSound()

    // Start the animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()

    return () => {
      if (soundRef.current) {
        const safeCleanup = async () => {
          try {
            if (typeof soundRef.current.getStatusAsync === 'function') {
              try {
                const status = await soundRef.current.getStatusAsync();
                if (status.isLoaded) {
                  if (typeof soundRef.current.stopAsync === 'function') {
                    await soundRef.current.stopAsync().catch(() => {});
                  }
                  if (typeof soundRef.current.unloadAsync === 'function') {
                    await soundRef.current.unloadAsync().catch(() => {});
                  }
                  console.log("Sound cleaned up successfully");
                }
              } catch (statusError) {
                console.log("Error checking sound status:", statusError);
              }
            }
          } catch (error) {
            console.log("Error in cleanup:", error);
          } finally {
            soundRef.current = null;
          }
        };
        safeCleanup();
      }
    };
  }, [])

  const loadSound = async () => {
    try {
      const audioUrl = await getAudioFileUrl("jungle-drums.mp3"); // Fetch the audio URL from Supabase
      console.log("Fetched audio URL:", audioUrl); // Debug the URL
      // if (!audioUrl) throw new Error("Audio URL is null or undefined");

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        {
          isLooping: true,
          shouldPlay: true,
          volume: 0.7,
        }
      );
      soundRef.current = sound;
      setSoundLoaded(true);
      console.log("Splash screen sound loaded and playing");
    } catch (error) {
      console.error("Error loading jungle sound:", error);
    }
  }

  const handleStartGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Safe sound stopping
    if (soundRef.current) {
      (async () => {
        try {
          if (typeof soundRef.current.getStatusAsync === 'function') {
            const status = await soundRef.current.getStatusAsync();
            if (status.isLoaded && typeof soundRef.current.stopAsync === 'function') {
              await soundRef.current.stopAsync();
            }
          }
        } catch (error) {
          console.log("Non-critical audio error:", error);
        }
      })();
    }
    
    // Always continue with game
    onStartGame();
  }

  const handleBackToHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (soundRef.current) {
      try {
        soundRef.current.getStatusAsync().then(status => {
          if (status.isLoaded) {
            soundRef.current.stopAsync();
          }
        }).catch(error => {
          console.error("Error stopping sound:", error);
        });
      } catch (error) {
        console.error("Error stopping sound:", error);
      }
    }
    // Use type checking before calling onBackToHome
    if (typeof onBackToHome === 'function') {
      onBackToHome();
    } else {
      console.warn("onBackToHome is not a function");
    }
  }

  return (
    <ImageBackground source={require("./assets/images/jungle-splash.jpg")} style={styles.container} resizeMode="cover">
      <View style={styles.overlay}>
        {/* Owl animation at the top */}
        <View style={styles.topSection}>
          <LottieView source={require("./assets/animations/owl.json")} autoPlay loop style={styles.owlAnimation} />
        </View>

        {/* Main content in the middle */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Spelling Safari</Text>
          <Text style={styles.subtitle}>Learn to spell in the jungle!</Text>

          {/* Buttons at the bottom */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.startButton} onPress={handleStartGame} activeOpacity={0.7}>
              <ImageBackground
                source={require("./assets/images/wooden-button.png")}
                style={styles.woodenButton}
                resizeMode="stretch"
              >
                <Text style={styles.startButtonText}>Start Adventure</Text>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={handleBackToHome} activeOpacity={0.7}>
              <ImageBackground
                source={require("./assets/images/wooden-button-small.png")}
                style={styles.woodenButtonSmall}
                resizeMode="stretch"
              >
                <Text style={styles.backButtonText}>Back to Games</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Leaves animation at the bottom */}
        <View style={styles.bottomSection}>
          <LottieView
            source={require("./assets/animations/jungle-leaves.json")}
            autoPlay
            loop
            style={styles.leavesAnimation}
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
    backgroundColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  topSection: {
    width: "100%",
    height: height * 0.2,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 170,
  },
  owlAnimation: {
    width: width * 0.4,
    height: width * 0.4,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  title: {
    fontSize: Math.min(width * 0.1, 60),
    fontFamily: "OpenDyslexic-Bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.85)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Math.min(width * 0.05, 24),
    fontFamily: "OpenDyslexic",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 20,
    textAlign: "center",
  },

  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  startButton: {
    width: width * 0.7,
    height: height * 0.115,
    marginBottom: 10,
  },
  woodenButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  startButtonText: {
    fontSize: Math.min(width * 0.05, 20),
    fontFamily: "OpenDyslexic-Bold",
    color: "#3E2723",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    width: width * 0.55,
    height: height * 0.100,
  },
  woodenButtonSmall: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: Math.min(width * 0.04, 16),
    fontFamily: "OpenDyslexic",
    color: "#3E2723",
    textAlign: "center",
  },
  bottomSection: {
    width: "100%",
    height: height * 0.15,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  leavesAnimation: {
    width: width,
    height: height * 0.175,
  },
})

