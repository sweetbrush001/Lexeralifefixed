"use client"

import { useState, useEffect, useRef } from "react"
import { View, TouchableOpacity, StyleSheet, Image } from "react-native"
import { Audio } from "expo-av"

import * as Haptics from "expo-haptics"

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
        const { sound: pirateSound } = await Audio.Sound.createAsync(
          require("../screens/games/assets/sounds/ocean-ambience.mp3"), 
          {
            isLooping: true,
            volume: 0.3,
            shouldPlay: false,
          }
        );

        // Check if sound object is valid
        if (!pirateSound) {
          console.error("Failed to create sound object");
          return;
        }

        soundObject = pirateSound;

        // Only set state if component is still mounted
        if (isMountedRef.current) {
          setSound(pirateSound)

          // Play sound if it should be playing and not muted
          if (isPlaying && !isMuted) {
            await pirateSound.playAsync().catch(err => 
              console.error("Error playing initial sound:", err)
            );
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
            await soundObject.stopAsync().catch(() => {});
            await soundObject.unloadAsync().catch(() => {});
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
          await sound.playAsync().catch(err => 
            console.error("Error playing sound:", err)
          );
        } else {
          await sound.pauseAsync().catch(err => 
            console.error("Error pausing sound:", err)
          );
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
        await sound.pauseAsync().catch(err => 
          console.error("Error pausing sound on toggle:", err)
        );
      } else {
        await sound.playAsync().catch(err => 
          console.error("Error playing sound on toggle:", err)
        );
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
                source={isMuted ? require("../screens/games/assets/images/volume-mute.png") : require("../screens/games/assets/images/volume-on.png")}
                style={styles.soundIcon}
              />
            </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 30,
    right: 20,
    zIndex: 10,
  },
  soundButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  soundIcon: {
    width: "100%",
    height: "100%",
  },
})

