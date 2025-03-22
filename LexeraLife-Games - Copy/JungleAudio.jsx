"use client";

import { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "./utils/mock-haptics";
import { getAudioFileUrl } from "./utils/supabaseService"; // Import the function to fetch audio URL

export default function JungleAudio({ isPlaying = true }) {
  const [sound, setSound] = useState(null);
  const [isMuted, setIsMuted] = useState(!isPlaying);
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const isMountedRef = useRef(true);
  const soundRef = useRef(null);

  useEffect(() => {
    const loadSound = async () => {
      try {
        setIsLoading(true); // Start loading
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });

        // Fetch the audio URL from Supabase
        const audioUrl = await getAudioFileUrl("jungle-ambience.mp3");
        console.log("Fetched audio URL:", audioUrl);

        if (!audioUrl) throw new Error("Audio URL is null or undefined");

        // Load the sound from the fetched URL
        const { sound: jungleSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          {
            isLooping: true,
            volume: 0.3,
            shouldPlay: !isMuted, // Play immediately if not muted
          }
        );

        if (isMountedRef.current) {
          soundRef.current = jungleSound;
        }

        console.log("Jungle sound loaded successfully");
      } catch (error) {
        console.error("Error loading jungle ambient sound:", error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    loadSound();

    return () => {
      isMountedRef.current = false;

      if (soundRef.current) {
        const cleanup = async () => {
          try {
            const status = await soundRef.current.getStatusAsync();
            if (status.isLoaded) {
              await soundRef.current.stopAsync();
              await soundRef.current.unloadAsync();
              console.log("Sound cleaned up successfully");
            } else {
              console.log("Sound was not loaded, skipping cleanup");
            }
          } catch (error) {
            if (error.message !== "Player does not exist.") {
              console.error("Error cleaning up sound:", error);
            }
          } finally {
            soundRef.current = null;
          }
        };
        cleanup();
      } else {
        console.log("No sound object to clean up");
      }
    };
  }, []);

  const toggleSound = async () => {
    if (!soundRef.current || isLoading) {
      console.warn("Sound is not ready yet!");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const newMutedState = !isMuted;
      setIsMuted(newMutedState);

      if (newMutedState) {
        await soundRef.current.pauseAsync();
      } else {
        // Ensure sound is loaded before attempting to play
        const status = await soundRef.current.getStatusAsync();
        if (!status.isLoaded) {
          await soundRef.current.loadAsync();
        }
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error("Error toggling sound:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.soundButton}
        onPress={toggleSound}
        accessibilityLabel={isMuted ? "Turn on jungle sounds" : "Turn off jungle sounds"}
      >
        <Image
          source={isMuted ? require("./assets/images/volume-mute.png") : require("./assets/images/volume-on.png")}
          style={styles.soundIcon}
        />
      </TouchableOpacity>
    </View>
  );
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
});