"use client"

import { useState, useEffect, useRef } from "react"
import { View, TouchableOpacity, StyleSheet, Image } from "react-native"
import { Audio } from "expo-av"
import * as Haptics from "expo-haptics" // Add missing Haptics import
import { getAudioFileUrl } from "../utils/supabaseService" // Import the function to fetch audio URL

export default function JungleAudio({ isPlaying = true }) {
  const [sound, setSound] = useState(null)
  const [isMuted, setIsMuted] = useState(!isPlaying)
  const [isLoading, setIsLoading] = useState(false) // Track loading state
  const isMountedRef = useRef(true)
  const soundRef = useRef(null)

  useEffect(() => {
    const loadSound = async () => {
      try {
        setIsLoading(true) // Start loading
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        })

        // Fetch the audio URL from Supabase
        const audioUrl = await getAudioFileUrl("jungle-ambience.mp3")
        console.log("Fetched audio URL:", audioUrl)

        if (!audioUrl) throw new Error("Audio URL is null or undefined")

        // Load the sound from the fetched URL
        const { sound: jungleSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          {
            isLooping: true,
            volume: 0.3,
            shouldPlay: !isMuted, // Play immediately if not muted
          },
        )

        if (isMountedRef.current) {
          soundRef.current = jungleSound
        }

        console.log("Jungle sound loaded successfully")
      } catch (error) {
        console.error("Error loading jungle ambient sound:", error)
      } finally {
        setIsLoading(false) // Stop loading
      }
    }

    loadSound()

    return () => {
      isMountedRef.current = false

      if (soundRef.current) {
        const safeCleanup = async () => {
          try {
            if (typeof soundRef.current.getStatusAsync === "function") {
              try {
                const status = await soundRef.current.getStatusAsync()
                if (status.isLoaded) {
                  if (typeof soundRef.current.stopAsync === "function") {
                    await soundRef.current.stopAsync().catch(() => {})
                  }
                  if (typeof soundRef.current.unloadAsync === "function") {
                    await soundRef.current.unloadAsync().catch(() => {})
                  }
                  console.log("Sound cleaned up successfully")
                }
              } catch (statusError) {
                console.log("Error checking sound status:", statusError)
              }
            }
          } catch (error) {
            console.log("Error in cleanup:", error)
          } finally {
            soundRef.current = null
          }
        }
        safeCleanup()
      } else {
        console.log("No sound object to clean up")
      }
    }
  }, [])

  const toggleSound = async () => {
    if (!soundRef.current || isLoading) {
      console.warn("Sound is not ready yet!")
      return
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      const newMutedState = !isMuted
      setIsMuted(newMutedState)

      try {
        if (newMutedState) {
          if (typeof soundRef.current.pauseAsync === "function") {
            await soundRef.current.pauseAsync()
          }
        } else {
          if (typeof soundRef.current.getStatusAsync === "function") {
            const status = await soundRef.current.getStatusAsync()
            if (!status.isLoaded && typeof soundRef.current.loadAsync === "function") {
              await soundRef.current.loadAsync()
            }
            if (typeof soundRef.current.playAsync === "function") {
              await soundRef.current.playAsync()
            }
          }
        }
      } catch (methodError) {
        console.log("Error with sound method in toggle:", methodError)
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
        accessibilityLabel={isMuted ? "Turn on jungle sounds" : "Turn off jungle sounds"}
      >
        <Image
          source={
            isMuted
              ? require("../screens/games/assets/images/volume-mute.png")
              : require("../screens/games/assets/images/volume-on.png")
          }
          style={styles.soundIcon}
        />
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
    width: 70,
    height: 70,
    borderRadius: 20,
    position: "absolute",
    top: 70,
    right: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  soundIcon: {
    width: "100%",
    height: "100%",
  },
})
