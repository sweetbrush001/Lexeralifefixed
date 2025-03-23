"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  TextInput,
  ImageBackground,
} from "react-native"
import { Audio } from "expo-av"
import * as Haptics from "./utils/mock-haptics"
import LottieView from "lottie-react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import AudioControls from "./components/AudioControls"
import ScoreBoard from "./components/ScoreBoard"
import DifficultySelect from "./components/DifficultySelect"
import GameSummary from "./components/GameSummary"
import SplashScreen from "./SplashScreen"
import JungleAudio from "./JungleAudio"
import { getWordsByDifficulty } from "./utils/supabaseService"

const { width, height } = Dimensions.get("window")

const CORRECT_SOUND = require("./assets/sounds/correct.mp3")
const INCORRECT_SOUND = require("./assets/sounds/incorrect.mp3")
const GAME_COMPLETE_SOUND = require("./assets/sounds/level-complete.mp3")

export default function SpellingGame({ onBackToHome }) {
  const [loading, setLoading] = useState(true)
  const [words, setWords] = useState([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentWord, setCurrentWord] = useState(null)
  const [userInput, setUserInput] = useState("")
  const [score, setScore] = useState(0)
  const [skippedWords, setSkippedWords] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [difficulty, setDifficulty] = useState(null)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showFailure, setShowFailure] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [showSplash, setShowSplash] = useState(true)

  const soundRef = useRef(null)
  const correctSoundRef = useRef(null)
  const incorrectSoundRef = useRef(null)
  const gameCompleteSoundRef = useRef(null)
  const isMountedRef = useRef(true)

  // Update the cleanup in useEffect to be more robust
  useEffect(() => {
    setupAudio()
    loadHighScore()

    return () => {
      isMountedRef.current = false

      // Clean up all sounds when component unmounts
      const cleanupSound = async (soundRef) => {
        if (soundRef.current) {
          try {
            const status = await soundRef.current.getStatusAsync()
            if (status.isLoaded) {
              await soundRef.current.stopAsync()
              await soundRef.current.unloadAsync()
            }
          } catch (error) {
            console.error("Error cleaning up sound:", error)
          }
        }
      }

      // Clean up each sound
      cleanupSound(soundRef)
      cleanupSound(correctSoundRef)
      cleanupSound(incorrectSoundRef)
      cleanupSound(gameCompleteSoundRef)
    }
  }, [])

  useEffect(() => {
    if (difficulty) {
      fetchWords()
    }
  }, [difficulty])

  useEffect(() => {
    if (words.length > 0 && currentWordIndex < words.length) {
      setCurrentWord(words[currentWordIndex])
      preloadAudio(words[currentWordIndex].audio_url)
    }
  }, [words, currentWordIndex])

  const loadHighScore = async () => {
    try {
      const savedHighScore = await AsyncStorage.getItem("highScore")
      if (savedHighScore) {
        setHighScore(Number.parseInt(savedHighScore))
      }
    } catch (error) {
      console.error("Error loading high score:", error)
    }
  }

  const updateHighScore = async (newScore) => {
    try {
      if (newScore > highScore) {
        await AsyncStorage.setItem("highScore", newScore.toString())
        setHighScore(newScore)
      }
    } catch (error) {
      console.error("Error saving high score:", error)
    }
  }

  // Update the setupAudio function to be more robust
  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      })

      // Create sound objects
      const correctSound = new Audio.Sound()
      const incorrectSound = new Audio.Sound()
      const gameCompleteSound = new Audio.Sound()

      // Load sounds with await to ensure they're fully loaded
      await correctSound.loadAsync(CORRECT_SOUND)
      await incorrectSound.loadAsync(INCORRECT_SOUND)
      await gameCompleteSound.loadAsync(GAME_COMPLETE_SOUND)

      // Set volume to ensure they're audible
      await correctSound.setVolumeAsync(1.0)
      await incorrectSound.setVolumeAsync(1.0)
      await gameCompleteSound.setVolumeAsync(1.0)

      // Store references
      correctSoundRef.current = correctSound
      incorrectSoundRef.current = incorrectSound
      gameCompleteSoundRef.current = gameCompleteSound

      console.log("Game sounds loaded successfully!")
    } catch (error) {
      console.error("Error setting up audio:", error)
    }
  }

  const fetchWords = async () => {
    try {
      const wordsWithUrls = await getWordsByDifficulty(difficulty)

      if (wordsWithUrls && wordsWithUrls.length > 0) {
        setWords(wordsWithUrls)
        setLoading(false)
        setGameStarted(true)
      } else {
        Alert.alert("Error", "No words found for this difficulty level.")
        setDifficulty(null)
      }
    } catch (error) {
      console.error("Error fetching words:", error)
      Alert.alert("Error", "Failed to load game data.")
      setDifficulty(null)
    }
  }

  const preloadAudio = async (audioUrl) => {
    if (!audioUrl) return

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl }, { shouldPlay: false })
      soundRef.current = sound
    } catch (error) {
      console.error("Error preloading audio:", error)
    }
  }

  const playWordAudio = async () => {
    if (!soundRef.current) return

    try {
      await soundRef.current.setRateAsync(playbackRate, true)
      await soundRef.current.playFromPositionAsync(0)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      console.error("Error playing audio:", error)
    }
  }

  const checkAnswer = () => {
    const isCorrect = userInput.toLowerCase().trim() === currentWord.word.toLowerCase()

    if (isCorrect) {
      handleCorrectAnswer()
    } else {
      handleIncorrectAnswer()
    }
    setUserInput("")
  }

  const handleCorrectAnswer = async () => {
    setScore(score + 1)
    setShowSuccess(true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    try {
      await correctSoundRef.current?.playFromPositionAsync(0)
    } catch (error) {
      console.error("Error playing correct sound:", error)
    }

    setTimeout(() => {
      setShowSuccess(false)
      moveToNextWord()
    }, 1500)
  }

  // Update the handleIncorrectAnswer function to check if sound is loaded
  const handleIncorrectAnswer = async () => {
    setShowFailure(true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)

    try {
      // Make sure the sound is loaded and ready
      if (incorrectSoundRef.current) {
        const status = await incorrectSoundRef.current.getStatusAsync()
        if (status.isLoaded) {
          await incorrectSoundRef.current.setPositionAsync(0)
          await incorrectSoundRef.current.playAsync()
        } else {
          console.log("Incorrect sound not loaded, attempting to reload")
          // Try to reload the sound if it's not loaded
          await incorrectSoundRef.current.loadAsync(INCORRECT_SOUND)
          await incorrectSoundRef.current.playAsync()
        }
      }
    } catch (error) {
      console.error("Error playing incorrect sound:", error)
    }

    setTimeout(() => {
      setShowFailure(false)
    }, 1500)
  }

  // Update the moveToNextWord function to check if sound is loaded
  const moveToNextWord = async () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
    } else {
      try {
        if (gameCompleteSoundRef.current) {
          const status = await gameCompleteSoundRef.current.getStatusAsync()
          if (status.isLoaded) {
            await gameCompleteSoundRef.current.setPositionAsync(0)
            await gameCompleteSoundRef.current.playAsync()
          } else {
            console.log("Game complete sound not loaded, attempting to reload")
            // Try to reload the sound if it's not loaded
            await gameCompleteSoundRef.current.loadAsync(GAME_COMPLETE_SOUND)
            await gameCompleteSoundRef.current.playAsync()
          }
        }
      } catch (error) {
        console.error("Error playing game complete sound:", error)
      }

      await updateHighScore(score)
      setGameComplete(true)
    }
  }

  const handleSkip = () => {
    setSkippedWords(skippedWords + 1)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    moveToNextWord()
  }

  // Update the handleEndGame function to check if sound is loaded
  const handleEndGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    // Keep using the standard Alert but modify the callback
    Alert.alert("End Game", "Are you sure you want to end the game?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "End Game",
        onPress: async () => {
          // Play game complete sound before ending the game
          try {
            if (gameCompleteSoundRef.current) {
              const status = await gameCompleteSoundRef.current.getStatusAsync()
              if (status.isLoaded) {
                await gameCompleteSoundRef.current.setPositionAsync(0)
                await gameCompleteSoundRef.current.playAsync()
              } else {
                console.log("Game complete sound not loaded, attempting to reload")
                // Try to reload the sound if it's not loaded
                await gameCompleteSoundRef.current.loadAsync(GAME_COMPLETE_SOUND)
                await gameCompleteSoundRef.current.playAsync()
              }

              // Wait for the sound to play a bit before ending the game
              setTimeout(async () => {
                await updateHighScore(score)
                setGameComplete(true)
              }, 500)
            } else {
              // If sound reference doesn't exist, just end the game
              await updateHighScore(score)
              setGameComplete(true)
            }
          } catch (error) {
            console.error("Error playing game complete sound:", error)
            await updateHighScore(score)
            setGameComplete(true)
          }
        },
      },
    ])
  }

  const resetGame = () => {
    setCurrentWordIndex(0)
    setScore(0)
    setSkippedWords(0)
    setUserInput("")
    setShowSuccess(false)
    setShowFailure(false)
    setGameComplete(false)
    // Shuffle words for a new game
    setWords([...words].sort(() => Math.random() - 0.5))
  }

  const handlePlayAgain = () => {
    resetGame()
  }

  const handleChangeDifficulty = () => {
    setDifficulty(null)
    setGameStarted(false)
    setGameComplete(false)
    resetGame()
  }

  const handleStartGame = () => {
    setShowSplash(false)
  }

  if (showSplash) {
    return <SplashScreen onStartGame={handleStartGame} onBackToHome={onBackToHome} />
  }

  if (!difficulty) {
    return <DifficultySelect onSelectDifficulty={setDifficulty} onBackToHome={onBackToHome} />
  }

  if (loading) {
    return (
      <ImageBackground source={require("./assets/images/jungle-background.jpg")} style={styles.loadingContainer}>
        <View style={styles.loadingOverlay}>
          <LottieView
            source={require("./assets/animations/loading.json")}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
          <Text style={styles.loadingText}>Loading spelling game...</Text>
        </View>
      </ImageBackground>
    )
  }

  if (gameComplete) {
    return (
      <GameSummary
        score={score}
        totalWords={words.length}
        skippedWords={skippedWords}
        difficulty={difficulty}
        highScore={highScore}
        onPlayAgain={handlePlayAgain}
        onChangeDifficulty={handleChangeDifficulty}
        onBackToHome={onBackToHome}
      />
    )
  }

  return (
    <ImageBackground source={require("./assets/images/game-screen-bg.jpg")} style={styles.container}>
      <JungleAudio />
  
      <View style={styles.overlay}>
        <ScoreBoard score={score} total={words.length} currentIndex={currentWordIndex} />
  
        {currentWord && (
          <View style={styles.gameContent}>
            <Text style={styles.levelText}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level</Text>
  
            {currentWord.image_url && (
              <ImageBackground
                source={require("./assets/images/wooden-frame.png")}
                style={styles.woodenFrame}
                resizeMode="stretch"
              >
                <Image source={{ uri: currentWord.image_url }} style={styles.wordImage} resizeMode="contain" />
              </ImageBackground>
            )}
  
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={userInput}
                onChangeText={setUserInput}
                placeholder="Type the word..."
                placeholderTextColor="#6e3413"
                autoCapitalize="none"
                onSubmitEditing={checkAnswer}
              />
              <TouchableOpacity style={styles.submitButton} onPress={checkAnswer}>
                <ImageBackground
                  source={require("./assets/images/wooden-button-small.png")}
                  style={styles.woodenButtonLong}
                  resizeMode="stretch"
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>
  
            {/* Ensure AudioControls is used correctly */}
            <AudioControls onPlayAudio={playWordAudio} playbackRate={playbackRate} setPlaybackRate={setPlaybackRate} />
  
            <View style={styles.gameButtons}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <ImageBackground
                  source={require("./assets/images/grey-button.png")}
                  style={styles.greyButton}
                  resizeMode="stretch"
                >
                  <Text style={styles.skipButtonText}>Skip</Text>
                </ImageBackground>
              </TouchableOpacity>
  
              <TouchableOpacity style={styles.endGameButton} onPress={handleEndGame}>
                <ImageBackground
                  source={require("./assets/images/red-button.png")}
                  style={styles.redButton}
                  resizeMode="stretch"
                >
                  <Text style={styles.endGameButtonText}>End Game</Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>
        )}
  
        {showSuccess && (
          <View style={styles.animationContainer}>
            <LottieView
              source={require("./assets/animations/correct.json")}
              autoPlay
              loop={false}
              style={styles.animation}
            />
          </View>
        )}
  
        {showFailure && (
          <View style={styles.animationContainer}>
            <LottieView
              source={require("./assets/animations/incorrect.json")}
              autoPlay
              loop={false}
              style={styles.animation}
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
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: width > 600 ? 40 : 20, // Responsive padding
  },
  loadingContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingAnimation: {
    width: Math.min(width * 0.4, 250),
    height: Math.min(width * 0.4, 250),
  },
  loadingText: {
    marginTop: 20,
    fontSize: width > 600 ? 22 : 18,
    fontFamily: "OpenDyslexic",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  gameContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: height * 0.02,
  },
  levelText: {
    fontSize: width > 600 ? 22 : 18,
    fontFamily: "OpenDyslexic-Bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.85)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginTop: height * 0.03,
  },
  woodenFrame: {
    width: width > 600 ? 400 : width * 0.8,
    height: width > 600 ? Math.min(height * 0.25, 300) : height * 0.25,
    justifyContent: "center",
    alignItems: "center",
    padding: width > 600 ? 20 : 15,
    marginVertical: height * 0.02,
  },
  wordImage: {
    width: "70%",
    height: "60%",
    borderRadius: 10,
  },
  inputContainer: {
    width: "100%",
    marginVertical: height * 0.02,
    alignItems: "center",
  },
  input: {
    backgroundColor: "#cf9853",
    padding: width > 600 ? 15 : 10,
    borderRadius: 10,
    fontSize: width > 600 ? 18 : 16,
    fontFamily: "OpenDyslexic",
    marginBottom: 10,
    textAlign: "center",
    borderWidth: 3,
    borderColor: "#B2711D",
    width: width > 600 ? "80%" : "90%",
    maxWidth: 500,
  },
  submitButton: {
    width: width > 600 ? 250 : width * 0.7,
    height: width > 600 ? 60 : height * 0.07,
    alignItems: "center",
  },
  woodenButtonLong: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: width > 600 ? 20 : 16,
    fontFamily: "OpenDyslexic-Bold",
  },
  gameButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width > 600 ? "70%" : "85%",
    maxWidth: 600,
    marginTop: height * 0.03,
    marginBottom: height * 0.04,
  },
  skipButton: {
    padding: width > 600 ? 15 : 10,
    paddingHorizontal: width > 600 ? 25 : 20,
  },
  greyButton: {
    width: width > 600 ? 140 : width * 0.25,
    height: width > 600 ? 50 : height * 0.055,
    justifyContent: "center",
    alignItems: "center",
  },
  skipButtonText: {
    color: "#FFFFFF",
    fontSize: width > 600 ? 16 : 14,
    fontFamily: "OpenDyslexic",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
    textAlign: "center",
  },
  endGameButton: {
    padding: width > 600 ? 15 : 10,
    paddingHorizontal: width > 600 ? 25 : 20,
  },
  redButton: {
    width: width > 600 ? 160 : width * 0.3,
    height: width > 600 ? 50 : height * 0.055,
    justifyContent: "center",
    alignItems: "center",
  },
  endGameButtonText: {
    color: "#FFFFFF",
    fontSize: width > 600 ? 16 : 14,
    fontFamily: "OpenDyslexic",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
    textAlign: "center",
  },
  animationContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    zIndex: 10,
  },
  animation: {
    width: width > 600 ? 250 : width * 0.4,
    height: width > 600 ? 250 : width * 0.4,
  },
})

