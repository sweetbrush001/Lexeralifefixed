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
import * as Haptics from "expo-haptics"
import LottieView from "lottie-react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import AudioControls from "../../components/games/AudioControls"
import ScoreBoard from "../../components/games/ScoreBoard"
import DifficultySelect from "../../components/games/DifficultySelect"
import GameSummary from "../../components/games/GameSummary"
import SplashScreen from "./SplashScreen"
import JungleAudio from "../../data/JungleAudio"
import { getWordsByDifficulty } from "../../utils/supabaseService"

const { width, height } = Dimensions.get("window")

const CORRECT_SOUND = require("./assets/sounds/correct.mp3")
const INCORRECT_SOUND = require("./assets/sounds/incorrect.mp3")
const GAME_COMPLETE_SOUND = require("./assets/sounds/level-complete.mp3")

export default function SpellingGame({ onBackToHome = () => {} }) {
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
  const [selectedOption, setSelectedOption] = useState(null) // Add missing state

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

      try {
        // Create sound objects with more safety checks
        const { sound: correctSound } = await Audio.Sound.createAsync(CORRECT_SOUND);
        const { sound: incorrectSound } = await Audio.Sound.createAsync(INCORRECT_SOUND);
        const { sound: gameCompleteSound } = await Audio.Sound.createAsync(GAME_COMPLETE_SOUND);

        // Store references
        correctSoundRef.current = correctSound;
        incorrectSoundRef.current = incorrectSound;
        gameCompleteSoundRef.current = gameCompleteSound;

        console.log("Game sounds loaded successfully!");
      } catch (soundError) {
        console.error("Error loading specific sound:", soundError);
      }
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
    if (!soundRef.current) return;

    try {
      // Give haptic feedback regardless
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Safe audio check and playback
      if (typeof soundRef.current.getStatusAsync === 'function') {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (typeof soundRef.current.setRateAsync === 'function') {
            await soundRef.current.setRateAsync(playbackRate, true);
          }
          if (typeof soundRef.current.playFromPositionAsync === 'function') {
            await soundRef.current.playFromPositionAsync(0);
          } else if (typeof soundRef.current.playAsync === 'function') {
            await soundRef.current.playAsync();
          }
        } else {
          console.log("Sound not loaded, can't play");
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

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
      if (incorrectSoundRef.current) {
        try {
          const status = await incorrectSoundRef.current.getStatusAsync()
          if (status.isLoaded) {
            await incorrectSoundRef.current.setPositionAsync(0)
            await incorrectSoundRef.current.playAsync()
          }
        } catch (soundError) {
          console.log("Error with sound playback:", soundError)
        }
      }
    } catch (error) {
      console.error("Error handling incorrect answer:", error)
    }

    setTimeout(() => {
      setShowFailure(false)
      setSelectedOption(null)
      moveToNextWord() // Change to moveToNextWord instead of moveToNextQuestion
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
          try {
            if (gameCompleteSoundRef.current) {
              const status = await gameCompleteSoundRef.current.getStatusAsync()
              if (status.isLoaded) {
                await gameCompleteSoundRef.current.setPositionAsync(0)
                await gameCompleteSoundRef.current.playAsync()
              } else {
                console.log("Game complete sound not loaded, attempting to reload")
                try {
                  await gameCompleteSoundRef.current.loadAsync(GAME_COMPLETE_SOUND)
                  await gameCompleteSoundRef.current.playAsync()
                } catch (loadError) {
                  console.error("Error reloading game complete sound:", loadError)
                }
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
    padding: 20,
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
    width: Math.min(width * 0.5, 200),
    height: Math.min(width * 0.5, 200),
  },
  loadingText: {
    marginTop: 20,
    fontSize: Math.min(width * 0.06, 24),
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
  },
  levelText: {
    fontSize: Math.min(width * 0.06, 24),
    fontFamily: "OpenDyslexic-Bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.85)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginTop: height * 0.01,
  },
  woodenFrame: {
    width: Math.min(width * 0.9, 350),
    height: Math.min(height * 0.3, 400),
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginVertical: height * 0.01,
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
    padding: 10,
    borderRadius: 10,
    fontSize: Math.min(width * 0.05, 16),
    fontFamily: "OpenDyslexic",
    marginBottom: 10,
    textAlign: "center",
    borderWidth: 3,
    borderColor: "#B2711D",
    width: "90%",
  },
  submitButton: {
    width: Math.min(width * 0.8, 200),
    height: Math.min(height * 0.08, 70),
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
    fontSize: Math.min(width * 0.05, 20),
    fontFamily: "OpenDyslexic-Bold",
  },
  gameButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: height * 0.03,
    marginBottom: height * 0.05,
  },
  skipButton: {
    padding: 10,
    paddingHorizontal: 20,
  },
  greyButton: {
    width: Math.min(width * 0.3, 120),
    height: Math.min(height * 0.06, 50),
    justifyContent: "center",
    alignItems: "center",
  },
  skipButtonText: {
    color: "#FFFFFF",
    fontSize: Math.min(width * 0.04, 16),
    fontFamily: "OpenDysic",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
    textAlign: "center",
  },
  endGameButton: {
    padding: 10,
    paddingHorizontal: 20,
  },
  redButton: {
    width: Math.min(width * 0.35, 150),
    height: Math.min(height * 0.06, 50),
    justifyContent: "center",
    alignItems: "center",
  },
  endGameButtonText: {
    color: "#FFFFFF",
    fontSize: Math.min(width * 0.04, 16),
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
    width: Math.min(width * 0.5, 200),
    height: Math.min(width * 0.5, 200),
  },
})

