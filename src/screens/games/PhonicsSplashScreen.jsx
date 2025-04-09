"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Animated, Dimensions } from "react-native"
import { Audio } from "expo-av"
import LottieView from "lottie-react-native"
import * as Haptics from "expo-haptics"

const { width, height } = Dimensions.get("window")

export default function PhonicsSplashScreen({ onStartGame, onBackToHome }) {
  const [soundLoaded, setSoundLoaded] = useState(false)
  const soundRef = useRef(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const isMounted = useRef(true)

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
      isMounted.current = false
      if (soundRef.current) {
        const cleanup = async () => {
          try {
            // Check if the sound object exists and has the unloadAsync method
            if (typeof soundRef.current === "object" && soundRef.current.unloadAsync) {
              await soundRef.current.unloadAsync().catch(() => {})
            }
          } catch (error) {
            // Silently handle errors to prevent crashes during cleanup
            console.log("Cleanup handled gracefully")
          }
        }
        cleanup()
      }
    }
  }, [])

  const loadSound = async () => {
    try {
      // Configure audio mode first
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      })

      // Use the createAsync method with all options in the initial config
      const { sound } = await Audio.Sound.createAsync(require("../games/assets/sounds/ocean-ambience.mp3"), {
        shouldPlay: true,
        isLooping: true,
        volume: 0.7,
      })

      if (isMounted.current) {
        soundRef.current = sound
        setSoundLoaded(true)
        console.log("Splash screen sound loaded successfully")
      } else {
        // Clean up if component unmounted during loading
        if (sound && typeof sound === "object" && sound.unloadAsync) {
          await sound.unloadAsync().catch(() => {})
        }
      }
    } catch (error) {
      console.error("Error loading pirate sound:", error)
    }
  }

  const handleStartGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    if (soundRef.current) {
      const cleanup = async () => {
        try {
          if (typeof soundRef.current === "object" && soundRef.current.unloadAsync) {
            await soundRef.current.unloadAsync().catch(() => {})
          }
        } catch (error) {
          console.log("Error stopping sound:", error)
        }
      }
      cleanup()
    }
    onStartGame()
  }

  const handleBackToHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (soundRef.current) {
      const cleanup = async () => {
        try {
          if (typeof soundRef.current === "object" && soundRef.current.unloadAsync) {
            await soundRef.current.unloadAsync().catch(() => {})
          }
        } catch (error) {
          console.log("Error stopping sound:", error)
        }
      }
      cleanup()
    }
    onBackToHome()
  }

  return (
    <ImageBackground
      source={require("../games/assets/images/Phonics/splash-screen.webp")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
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
          <Text style={styles.title}>Pirate Phonics</Text>
          <Text style={styles.subtitle}>Sail the seas of sounds!</Text>

          <LottieView
            source={require("../games/assets/animations/parrot.json")}
            autoPlay
            loop
            style={styles.treasureAnimation}
          />

          {/* Buttons at the bottom */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.startButton} onPress={handleStartGame} activeOpacity={0.7}>
              <ImageBackground
                source={require("../games/assets/images/Phonics/pirate-wood.png")}
                style={styles.woodenButton}
                resizeMode="stretch"
              >
                <Text style={styles.startButtonText}>Start Adventure</Text>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={handleBackToHome} activeOpacity={0.7}>
              <ImageBackground
                source={require("../games/assets/images/Phonics/pirate-grey.png")}
                style={styles.woodenButtonSmall}
                resizeMode="stretch"
              >
                <Text style={styles.backButtonText}>Back to Games</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Waves animation at the bottom */}
        <View style={styles.bottomSection}>
          <LottieView
            source={require("../games/assets/animations/sea-waves.json")}
            autoPlay
            loop
            style={styles.wavesAnimation}
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
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  parrotAnimation: {
    width: width * 0.3,
    height: width * 0.3,
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
  treasureAnimation: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 20,
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  startButton: {
    width: width * 0.6,
    height: height * 0.1,
    marginBottom: 10,
  },
  woodenButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  startButtonText: {
    fontSize: Math.min(width * 0.04, 24),
    fontFamily: "OpenDyslexic-Bold",
    color: "#eb9f2d",
    textAlign: "center",
  },
  backButton: {
    width: width * 0.6,
    height: height * 0.1,
  },
  woodenButtonSmall: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: Math.min(width * 0.04, 18),
    fontFamily: "OpenDyslexic",
    color: "#609df7",
    textAlign: "center",
  },
  bottomSection: {
    width: "100%",
    height: height * 0.15,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  wavesAnimation: {
    width: width * 5,
    height: height * 0.25,
  },
})
