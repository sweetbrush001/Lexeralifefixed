"use client"

import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Animated, Dimensions } from "react-native"
import LottieView from "lottie-react-native"
import * as Haptics from "expo-haptics"
import { useRef, useEffect, useState } from "react"
import { Audio } from "expo-av"

const { width, height } = Dimensions.get("window")

export default function PhonicsDifficultySelect({ onSelectDifficulty, onBackToHome }) {
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
    }).start()

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
        })

        // Create and load the sound with looping enabled in the initial options
        const { sound } = await Audio.Sound.createAsync(require(".//assets/sounds/ocean-ambience.mp3"), {
          shouldPlay: true,
          isLooping: true,
          volume: 0.5,
        })

        // Only set state if component is still mounted
        if (isMounted.current) {
          soundRef.current = sound
          setSoundLoaded(true)
          console.log("Difficulty select sound loaded and playing")
        } else {
          // If component unmounted during setup, clean up immediately
          try {
            await sound.unloadAsync()
          } catch (error) {
            console.error("Error unloading sound during cleanup:", error)
          }
        }
      } catch (error) {
        console.error("Error setting up difficulty select sound:", error)
      }
    }

    setupAudio()

    // Cleanup function
    return () => {
      console.log("PhonicsDifficultySelect unmounting, cleaning up resources")
      isMounted.current = false

      // Clean up sound
      if (soundRef.current) {
        const cleanup = async () => {
          try {
            soundRef.current.unloadAsync().catch(() => {})
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
      require(".//assets/animations/loading.json")
    } catch (error) {
      console.error("Error loading animation:", error)
      setAnimationLoaded(false)
    }
  }, [])

  const handleSelect = (difficulty) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    // Stop sound before navigating
    const stopSound = async () => {
      if (soundRef.current && soundLoaded) {
        try {
          await soundRef.current.unloadAsync().catch(() => {})
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
          await soundRef.current.unloadAsync().catch(() => {})
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
      source={require(".//assets/images/Phonics/treasure.webp")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Choose Yer Challenge</Text>

        <Animated.View style={[styles.buttonsContainer, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity style={styles.difficultyButton} onPress={() => handleSelect("easy")} activeOpacity={0.7}>
            <ImageBackground
              source={require(".//assets/images/Phonics/pirate-green.png")}
              style={styles.woodenSign1}
              resizeMode="contain"
            >
              <Text style={styles.buttonText1}>Cabin Boy</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity style={styles.difficultyButton} onPress={() => handleSelect("medium")} activeOpacity={0.7}>
            <ImageBackground
              source={require(".//assets/images/Phonics/pirate-yellow.png")}
              style={styles.woodenSign2}
              resizeMode="contain"
            >
              <Text style={styles.buttonText2}>First Mate</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity style={styles.difficultyButton} onPress={() => handleSelect("hard")} activeOpacity={0.7}>
            <ImageBackground
              source={require(".//assets/images/Phonics/pirate-red.png")}
              style={styles.woodenSign2}
              resizeMode="contain"
            >
              <Text style={styles.buttonText3}>Captain</Text>
            </ImageBackground>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={styles.backButton} onPress={handleBackToHome} activeOpacity={0.7}>
          <ImageBackground
            source={require(".//assets/images/Phonics/pirate-wood.png")}
            style={styles.woodenButtonSmall}
            resizeMode="stretch"
          >
            <Text style={styles.backButtonText}>Back to Port</Text>
          </ImageBackground>
        </TouchableOpacity>

        {animationLoaded && (
          <View style={styles.animationContainer}>
            <LottieView
              source={require(".//assets/animations/ship-load.json")}
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
    backgroundColor: "rgba(0,0,0,0.3)",
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
  },
  difficultyButton: {
    width: width * 0.7,
    height: height * 0.12,
    marginBottom: height * 0.015, // Reduced gap between buttons
    alignItems: "center",
    justifyContent: "center",
  },
  woodenSign1: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    aspectRatio: 1.5,
  },
  woodenSign2: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    aspectRatio: 1.6,
  },
  buttonText1: {
    fontSize: Math.min(width * 0.04, 24),
    fontFamily: "OpenDyslexic-Bold",
    color: "#3afcab",
    textAlign: "center",
    transform: [{ translateY: -2 }],
    paddingHorizontal: 10,
  },
  buttonText2: {
    fontSize: Math.min(width * 0.04, 24),
    fontFamily: "OpenDyslexic-Bold",
    color: "#fcc83a",
    textAlign: "center",
    transform: [{ translateY: -2 }],
    paddingHorizontal: 10,
  },
  buttonText3: {
    fontSize: Math.min(width * 0.04, 24),
    fontFamily: "OpenDyslexic-Bold",
    color: "#f76565",
    textAlign: "center",
    transform: [{ translateY: -5 }],
    paddingHorizontal: 10,
  },
  backButton: {
    width: width * 0.45,
    height: height * 0.08,
    marginBottom: height * 0.05,
  },
  woodenButtonSmall: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: Math.min(width * 0.03, 20),
    fontFamily: "OpenDyslexic-Bold",
    color: "#eb9f2d",
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
