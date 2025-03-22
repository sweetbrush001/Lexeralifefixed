import React, { createContext, useState, useEffect } from "react";
import { Audio } from "expo-av";

export const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [backgroundSound, setBackgroundSound] = useState(null);

  useEffect(() => {
    const loadBackgroundSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/background-music.mp3"),
        { isLooping: true }
      );
      setBackgroundSound(sound);
      if (!isMuted) {
        await sound.playAsync();
      }
    };

    loadBackgroundSound();

    return () => {
      if (backgroundSound) {
        backgroundSound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (backgroundSound) {
      if (isMuted) {
        backgroundSound.pauseAsync();
      } else {
        backgroundSound.playAsync();
      }
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
};