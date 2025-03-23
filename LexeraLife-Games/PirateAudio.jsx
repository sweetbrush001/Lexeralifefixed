"use client"

import { useState, useEffect, useRef } from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { Audio } from "expo-av"
import { Feather } from "@expo/vector-icons"
import * as Haptics from "./utils/mock-haptics"

export default function PirateAudio({ isPlaying = true }) {
  const [sound, setSound] = useState(null)
  const [isMuted, setIsMuted] = useState(!isPlaying)
  const isMountedRef = useRef(true)

  // Load sound when component mounts
  useEffect(() => {
    let soundObject = null

    const loadSound = async () => {
      try {
        // Ensure we're not interfering with other audio
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        })

        // Create and load the sound
        const { sound: pirateSound } = await Audio.Sound.createAsync(require("./assets/sounds/ocean-ambience.mp3"), {
          isLooping: true,
          volume: 0.3,
          // Don't auto-play, we'll control this manually
          shouldPlay: false,
        })

        soundObject = pirateSound

        // Only set state if component is still mounted
        if (isMountedRef.current) {
          setSound(pirateSound)

          // Play sound if it should be playing and not muted
          if (isPlaying && !isMuted) {
            await pirateSound.playAsync()
          }
        }
      } catch (error) {
        console.error("Error loading pirate ambient sound:", error)
      }
    }

    loadSound()

    // Cleanup function
    return () => {
      isMountedRef.current = false

      // Important: Stop and unload the sound when component unmounts
      if (soundObject) {
        const cleanup = async () => {
          try {
            await soundObject.stopAsync()
            await soundObject.unloadAsync()
          } catch (error) {
            console.error("Error cleaning up sound:", error)
          }
        }
        cleanup()
      }
    }
  }, [])

  // Handle changes to isPlaying prop
  useEffect(() => {
    if (!sound) return

    const updatePlayback = async () => {
      try {
        if (isPlaying && !isMuted) {
          await sound.playAsync()
        } else {
          await sound.pauseAsync()
        }
      } catch (error) {
        console.error("Error updating sound playback:", error)
      }
    }

    updatePlayback()
  }, [isPlaying, sound])

  const toggleSound = async () => {
    if (!sound) return

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      // Toggle muted state
      const newMutedState = !isMuted
      setIsMuted(newMutedState)

      // Update sound playback based on new state
      if (newMutedState) {
        await sound.pauseAsync()
      } else {
        await sound.playAsync()
      }
    } catch (error) {
      console.error("Error toggling sound:", error)
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.soundButton}
        onPress={toggleSound}
        accessibilityLabel={isMuted ? "Turn on pirate sounds" : "Turn off pirate sounds"}
      >
        <Feather name={isMuted ? "volume-x" : "volume-2"} size={24} color="white" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  soundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
})

