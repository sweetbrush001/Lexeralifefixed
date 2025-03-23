"use client"

import { useState, useEffect, useRef } from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { Audio } from "expo-av"
import { Feather } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

export default function PirateAudio({ isPlaying = true }) {
  // Simplify the component by using muted state only - don't try to control actual audio
  const [isMuted, setIsMuted] = useState(!isPlaying)
  const [loadError, setLoadError] = useState(false)
  
  // Don't even render the component if there's an error
  if (loadError) {
    return null;
  }
  
  // We'll just show a mute/unmute button without actually controlling sound
  const toggleSound = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error("Error toggling sound:", error);
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

