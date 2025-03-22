"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import * as Font from "expo-font"
import * as Audio from "expo-av"
import SpellingGame from "./SpellingGame"
import PhonicsGame from "./PhonicsGame"
import HomePage from "./HomePage"

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [currentScreen, setCurrentScreen] = useState("home") // "home", "spelling", "phonics"

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          OpenDyslexic: require("./assets/fonts/OpenDyslexic3-Regular.ttf"),
          "OpenDyslexic-Bold": require("./assets/fonts/OpenDyslexic3-Bold.ttf"),
          "OpenDyslexic-Italic": require("./assets/fonts/OpenDyslexic-Italic.otf"),
        })
        setFontsLoaded(true)
      } catch (error) {
        console.error("Error loading fonts:", error)
        // Fallback to system fonts if OpenDyslexic fails to load
       // setFontsLoaded(true)
      }
    }

    loadFonts()

    // Set up audio mode once at app startup
   // setupAudio()
  }, [])

  // Set up audio mode for the entire app
 // const setupAudio = async () => {
    //try {
      //await Audio.setAudioModeAsync({
      //  allowsRecordingIOS: false,
       // playsInSilentModeIOS: true,
        //shouldDuckAndroid: true,
        ////playThroughEarpieceAndroid: false,
       // staysActiveInBackground: false,
      //})
    //} catch (error) {
      //console.error("Error setting up audio mode:", error)
    //}
  //}

  const handleSelectGame = (game) => {
    if (game === "spelling") {
      setCurrentScreen("spelling")
    } else if (game === "phonics") {
      setCurrentScreen("phonics")
    }
    // Add more game options here in the future
  }

  const handleBackToHome = async () => {
    // Just update the screen state
    setCurrentScreen("home")
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A1B9A" />
        <Text style={styles.loadingText}>Loading fonts...</Text>
      </View>
    )
  }

  // Render the appropriate screen based on currentScreen state
  return (
    <View style={styles.container}>
      {currentScreen === "home" && <HomePage onSelectGame={handleSelectGame} />}
      {currentScreen === "spelling" && <SpellingGame onBackToHome={handleBackToHome} />}
      {currentScreen === "phonics" && <PhonicsGame onBackToHome={handleBackToHome} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontFamily: "System",
    color: "#6A1B9A",
  },
})

