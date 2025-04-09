"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Alert, ImageBackground } from "react-native"
import { Audio } from "expo-av"
import * as Speech from "expo-speech"
import * as Haptics from "expo-haptics"
import LottieView from "lottie-react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import PhonicsSplashScreen from "./PhonicsSplashScreen"
import PhonicsDifficultySelect from "./PhonicsDifficultySelect"
import PhonicsGameSummary from "./PhonicsGameSummary"
import PirateAudio from "../../data/PirateAudio"

const { width, height } = Dimensions.get("window")

// Hardcoded word data with syllables
const WORD_DATA = {
  easy: [
    {
      word: "apple",
      image_url: require("./assets/images/phonics-images/easy/apple.png"),
      syllables: [
        { text: "a", audio_url: require("./assets/sounds/phonics-sounds/easy/apple-a.mp3") },
        { text: "pple", audio_url: require("./assets/sounds/phonics-sounds/easy/apple-pl.mp3") },
      ],
    },
    {
      word: "ball",
      image_url: require("./assets/images/phonics-images/easy/ball.png"),
      syllables: [
        { text: "ba", audio_url: require("./assets/sounds/phonics-sounds/easy/ball-ba.mp3") },
        { text: "wl", audio_url: require("./assets/sounds/phonics-sounds/easy/ball-al.mp3") },
      ],
    },
    {
      word: "car",
      image_url: require("./assets/images/phonics-images/easy/car.png"),
      syllables: [
        { text: "ca", audio_url: require("./assets/sounds/phonics-sounds/easy/car-ca.mp3") },
        { text: "r", audio_url: require("./assets/sounds/phonics-sounds/easy/car-r.mp3") },
      ],
    },
    {
      word: "fan",
      image_url: require("./assets/images/phonics-images/easy/fan.png"),
      syllables: [
        { text: "fa", audio_url: require("./assets/sounds/phonics-sounds/easy/fan-fa.mp3") },
        { text: "n", audio_url: require("./assets/sounds/phonics-sounds/easy/fan-n.mp3") },
      ],
    },
    {
      word: "jar",
      image_url: require("./assets/images/phonics-images/easy/jar.png"),
      syllables: [
        { text: "j", audio_url: require("./assets/sounds/phonics-sounds/easy/jar-j.mp3") },
        { text: "ar", audio_url: require("./assets/sounds/phonics-sounds/easy/jar-ar.mp3") },
      ],
    },
    {
      word: "kite",
      image_url: require("./assets/images/phonics-images/easy/kite.png"),
      syllables: [
        { text: "k", audio_url: require("./assets/sounds/phonics-sounds/easy/kite-k.mp3") },
        { text: "ite", audio_url: require("./assets/sounds/phonics-sounds/easy/kite-ite.mp3") },
      ],
    },
    {
      word: "lamp",
      image_url: require("./assets/images/phonics-images/easy/lamp.png"),
      syllables: [
        { text: "l", audio_url: require("./assets/sounds/phonics-sounds/easy/lamp-la.mp3") },
        { text: "am", audio_url: require("./assets/sounds/phonics-sounds/easy/lamp-am.mp3") },
        { text: "p", audio_url: require("./assets/sounds/phonics-sounds/easy/lamp-p.mp3") },
      ],
    },
    {
      word: "milk",
      image_url: require("./assets/images/phonics-images/easy/milk.png"),
      syllables: [
        { text: "mi", audio_url: require("./assets/sounds/phonics-sounds/easy/milk-mi.mp3") },
        { text: "l", audio_url: require("./assets/sounds/phonics-sounds/easy/milk-l.mp3") },
        { text: "k", audio_url: require("./assets/sounds/phonics-sounds/easy/milk-k.mp3") },
      ],
    },
    {
      word: "rat",
      image_url: require("./assets/images/phonics-images/easy/rat.png"),
      syllables: [
        { text: "ra", audio_url: require("./assets/sounds/phonics-sounds/easy/rat-ra.mp3") },
        { text: "t", audio_url: require("./assets/sounds/phonics-sounds/easy/rat-t.mp3") },
      ],
    },
    {
      word: "top",
      image_url: require("./assets/images/phonics-images/easy/top.png"),
      syllables: [
        { text: "to", audio_url: require("./assets/sounds/phonics-sounds/easy/top-to.mp3") },
        { text: "p", audio_url: require("./assets/sounds/phonics-sounds/easy/top-p.mp3") },
      ],
    },
  ],
  medium: [
    {
      word: "book",
      image_url: require("./assets/images/phonics-images/medium/book.png"),
      syllables: [
        { text: "b", audio_url: require("./assets/sounds/phonics-sounds/medium/book-b.mp3") },
        { text: "oo", audio_url: require("./assets/sounds/phonics-sounds/medium/book-oo.mp3") },
        { text: "k", audio_url: require("./assets/sounds/phonics-sounds/medium/book-k.mp3") },
      ],
    },
    {
      word: "chair",
      image_url: require("./assets/images/phonics-images/medium/chair.png"),
      syllables: [
        { text: "ch", audio_url: require("./assets/sounds/phonics-sounds/medium/chair-ch.mp3") },
        { text: "air", audio_url: require("./assets/sounds/phonics-sounds/medium/chair-air.mp3") },
      ],
    },
    {
      word: "clock",
      image_url: require("./assets/images/phonics-images/medium/clock.png"),
      syllables: [
        { text: "cl", audio_url: require("./assets/sounds/phonics-sounds/medium/clock-cl.mp3") },
        { text: "ock", audio_url: require("./assets/sounds/phonics-sounds/medium/clock-ock.mp3") },
      ],
    },
    {
      word: "flower",
      image_url: require("./assets/images/phonics-images/medium/flower.png"),
      syllables: [
        { text: "fl", audio_url: require("./assets/sounds/phonics-sounds/medium/flower-fl.mp3") },
        { text: "ow", audio_url: require("./assets/sounds/phonics-sounds/medium/flower-ow.mp3") },
        { text: "er", audio_url: require("./assets/sounds/phonics-sounds/medium/flower-er.mp3") },
      ],
    },
    {
      word: "house",
      image_url: require("./assets/images/phonics-images/medium/house.png"),
      syllables: [
        { text: "h", audio_url: require("./assets/sounds/phonics-sounds/medium/house-h.mp3") },
        { text: "ou", audio_url: require("./assets/sounds/phonics-sounds/medium/house-ou.mp3") },
        { text: "se", audio_url: require("./assets/sounds/phonics-sounds/medium/house-se.mp3") },
      ],
    },
    {
      word: "piano",
      image_url: require("./assets/images/phonics-images/medium/piano.png"),
      syllables: [
        { text: "pi", audio_url: require("./assets/sounds/phonics-sounds/medium/piano-pi.mp3") },
        { text: "a", audio_url: require("./assets/sounds/phonics-sounds/medium/piano-a.mp3") },
        { text: "no", audio_url: require("./assets/sounds/phonics-sounds/medium/piano-no.mp3") },
      ],
    },
    {
      word: "queen",
      image_url: require("./assets/images/phonics-images/medium/queen.png"),
      syllables: [
        { text: "qu", audio_url: require("./assets/sounds/phonics-sounds/medium/queen-q.mp3") },
        { text: "een", audio_url: require("./assets/sounds/phonics-sounds/medium/queen-een.mp3") },
      ],
    },
    {
      word: "rose",
      image_url: require("./assets/images/phonics-images/medium/rose.png"),
      syllables: [
        { text: "ro", audio_url: require("./assets/sounds/phonics-sounds/medium/rose-ro.mp3") },
        { text: "se", audio_url: require("./assets/sounds/phonics-sounds/medium/rose-se.mp3") },
      ],
    },
    {
      word: "tree",
      image_url: require("./assets/images/phonics-images/medium/tree.png"),
      syllables: [
        { text: "tr", audio_url: require("./assets/sounds/phonics-sounds/medium/tree-tr.mp3") },
        { text: "ee", audio_url: require("./assets/sounds/phonics-sounds/medium/tree-ee.mp3") },
      ],
    },
    {
      word: "truck",
      image_url: require("./assets/images/phonics-images/medium/truck.png"),
      syllables: [
        { text: "tr", audio_url: require("./assets/sounds/phonics-sounds/medium/truck-tr.mp3") },
        { text: "uck", audio_url: require("./assets/sounds/phonics-sounds/medium/truck-ck.mp3") },
      ],
    },
  ],
  hard: [
    {
      word: "balloon",
      image_url: require("./assets/images/phonics-images/hard/balloon.png"),
      syllables: [
        { text: "ba", audio_url: require("./assets/sounds/phonics-sounds/hard/balloon-ba.mp3") },
        { text: "loon", audio_url: require("./assets/sounds/phonics-sounds/hard/balloon-loon.mp3") },
      ],
    },
    {
      word: "computer",
      image_url: require("./assets/images/phonics-images/hard/computer.png"),
      syllables: [
        { text: "com", audio_url: require("./assets/sounds/phonics-sounds/hard/computer-com.mp3") },
        { text: "pu", audio_url: require("./assets/sounds/phonics-sounds/hard/computer-pu.mp3") },
        { text: "ter", audio_url: require("./assets/sounds/phonics-sounds/hard/computer-ter.mp3") },
      ],
    },
    {
      word: "helicopter",
      image_url: require("./assets/images/phonics-images/hard/helicopter.png"),
      syllables: [
        { text: "hel", audio_url: require("./assets/sounds/phonics-sounds/hard/helicopter-hel.mp3") },
        { text: "i", audio_url: require("./assets/sounds/phonics-sounds/hard/helicopter-i.mp3") },
        { text: "cop", audio_url: require("./assets/sounds/phonics-sounds/hard/helicopter-cop.mp3") },
        { text: "ter", audio_url: require("./assets/sounds/phonics-sounds/hard/helicopter-ter.mp3") },
      ],
    },
    {
      word: "pencil",
      image_url: require("./assets/images/phonics-images/hard/pencil.png"),
      syllables: [
        { text: "pen", audio_url: require("./assets/sounds/phonics-sounds/hard/pencil-pen.mp3") },
        { text: "ci", audio_url: require("./assets/sounds/phonics-sounds/hard/pencil-ci.mp3") },
        { text: "l", audio_url: require("./assets/sounds/phonics-sounds/hard/pencil-l.mp3") },
      ],
    },
    {
      word: "rainbow",
      image_url: require("./assets/images/phonics-images/hard/rainbow.png"),
      syllables: [
        { text: "rain", audio_url: require("./assets/sounds/phonics-sounds/hard/rainbow-rain.mp3") },
        { text: "bow", audio_url: require("./assets/sounds/phonics-sounds/hard/rainbow-bow.mp3") },
      ],
    },
    {
      word: "sandwich",
      image_url: require("./assets/images/phonics-images/hard/sandwich.png"),
      syllables: [
        { text: "sand", audio_url: require("./assets/sounds/phonics-sounds/hard/sandwich-sand.mp3") },
        { text: "wich", audio_url: require("./assets/sounds/phonics-sounds/hard/sandwich-wich.mp3") },
      ],
    },
    {
      word: "scissors",
      image_url: require("./assets/images/phonics-images/hard/scissors.png"),
      syllables: [
        { text: "s", audio_url: require("./assets/sounds/phonics-sounds/hard/scissors-s.mp3") },
        { text: "cis", audio_url: require("./assets/sounds/phonics-sounds/hard/scissors-cis.mp3") },
        { text: "sors", audio_url: require("./assets/sounds/phonics-sounds/hard/scissors-sors.mp3") },
      ],
    },
    {
      word: "submarine",
      image_url: require("./assets/images/phonics-images/hard/submarine.png"),
      syllables: [
        { text: "sub", audio_url: require("./assets/sounds/phonics-sounds/hard/submarine-sub.mp3") },
        { text: "mar", audio_url: require("./assets/sounds/phonics-sounds/hard/submarine-mar.mp3") },
        { text: "ine", audio_url: require("./assets/sounds/phonics-sounds/hard/submarine-ine.mp3") },
      ],
    },
    {
      word: "television",
      image_url: require("./assets/images/phonics-images/hard/television.png"),
      syllables: [
        { text: "tel", audio_url: require("./assets/sounds/phonics-sounds/hard/television-tel.mp3") },
        { text: "e", audio_url: require("./assets/sounds/phonics-sounds/hard/television-e.mp3") },
        { text: "vision", audio_url: require("./assets/sounds/phonics-sounds/hard/television-vision.mp3") },
      ],
    },
    {
      word: "toothbrush",
      image_url: require("./assets/images/phonics-images/hard/toothbrush.png"),
      syllables: [
        { text: "too", audio_url: require("./assets/sounds/phonics-sounds/hard/toothbrush-too.mp3") },
        { text: "th", audio_url: require("./assets/sounds/phonics-sounds/hard/toothbrush-th.mp3") },
        { text: "bru", audio_url: require("./assets/sounds/phonics-sounds/hard/toothbrush-bru.mp3") },
        { text: "sh", audio_url: require("./assets/sounds/phonics-sounds/hard/toothbrush-sh.mp3") },
      ],
    },
  ],
}

// Sound effects
const CORRECT_SOUND = require("./assets/sounds/correct.mp3")
const INCORRECT_SOUND = require("./assets/sounds/incorrect.mp3")
const GAME_COMPLETE_SOUND = require("./assets/sounds/level-complete.mp3")

export default function PhonicsGame({ onBackToHome = () => {} }) {
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [difficulty, setDifficulty] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showFailure, setShowFailure] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [showSplash, setShowSplash] = useState(true)
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const syllableSoundRef = useRef(null)
  const correctSoundRef = useRef(null)
  const incorrectSoundRef = useRef(null)
  const gameCompleteSoundRef = useRef(null)
  const isMountedRef = useRef(true)

  // Set up audio and load high score
  useEffect(() => {
    setupAudio()
    loadHighScore()

    return () => {
      isMountedRef.current = false

      // Stop any ongoing speech
      if (typeof Speech.stop === 'function') {
        Speech.stop().catch(error => console.log("Error stopping speech:", error));
      }

      // Clean up all sounds with safe handling
      const safeCleanup = async (soundRef) => {
        if (soundRef.current) {
          try {
            if (typeof soundRef.current.getStatusAsync === 'function') {
              try {
                const status = await soundRef.current.getStatusAsync();
                if (status.isLoaded) {
                  if (typeof soundRef.current.stopAsync === 'function') {
                    await soundRef.current.stopAsync().catch(() => {});
                  }
                  if (typeof soundRef.current.unloadAsync === 'function') {
                    await soundRef.current.unloadAsync().catch(() => {});
                  }
                }
              } catch (error) {
                console.log("Error checking sound status during cleanup:", error);
              }
            }
          } catch (error) {
            console.log("Error in cleanup:", error);
          }
        }
      };

      // Clean up each sound
      safeCleanup(syllableSoundRef);
      safeCleanup(correctSoundRef);
      safeCleanup(incorrectSoundRef);
      safeCleanup(gameCompleteSoundRef);
    }
  }, [])

  // Generate questions when difficulty is selected
  useEffect(() => {
    if (difficulty) {
      generateQuestions()
    }
  }, [difficulty])

  // Set current question when questions change or index changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setCurrentQuestion(questions[currentQuestionIndex])
      generateOptions(questions[currentQuestionIndex])
      preloadAudio(questions[currentQuestionIndex])
    }
  }, [questions, currentQuestionIndex])

  // Load high score from AsyncStorage
  const loadHighScore = async () => {
    try {
      const savedHighScore = await AsyncStorage.getItem("phonicsHighScore")
      if (savedHighScore) {
        setHighScore(Number.parseInt(savedHighScore))
      }
    } catch (error) {
      console.error("Error loading high score:", error)
    }
  }

  // Update high score if needed
  const updateHighScore = async (newScore) => {
    try {
      if (newScore > highScore) {
        await AsyncStorage.setItem("phonicsHighScore", newScore.toString())
        setHighScore(newScore)
      }
    } catch (error) {
      console.error("Error saving high score:", error)
    }
  }

  // Set up audio for the game
  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Handle each sound separately with try/catch
      try {
        const { sound: correctSound } = await Audio.Sound.createAsync(
          CORRECT_SOUND,
          { volume: 1.0 }
        );
        correctSoundRef.current = correctSound;
        console.log("Correct sound loaded");
      } catch (error) {
        console.error("Failed to load correct sound:", error);
      }
      
      try {
        const { sound: incorrectSound } = await Audio.Sound.createAsync(
          INCORRECT_SOUND,
          { volume: 1.0 }
        );
        incorrectSoundRef.current = incorrectSound;
        console.log("Incorrect sound loaded");
      } catch (error) {
        console.error("Failed to load incorrect sound:", error);
      }
      
      try {
        const { sound: gameCompleteSound } = await Audio.Sound.createAsync(
          GAME_COMPLETE_SOUND,
          { volume: 1.0 }
        );
        gameCompleteSoundRef.current = gameCompleteSound;
        console.log("Game complete sound loaded");
      } catch (error) {
        console.error("Failed to load game complete sound:", error);
      }
      
      console.log("Game sounds setup completed");
    } catch (error) {
      console.error("Error setting up audio:", error);
    }
  }

  // Generate questions based on difficulty
  const generateQuestions = () => {
    try {
      // Get words for the selected difficulty
      const words = WORD_DATA[difficulty]

      if (!words || words.length === 0) {
        Alert.alert("Error", "No words found for this difficulty level.")
        setDifficulty(null)
        return
      }

      // Shuffle words and take 10
      const shuffledWords = [...words].sort(() => Math.random() - 0.5)
      const selectedWords = shuffledWords.slice(0, 10)

      // Create questions from words
      const generatedQuestions = selectedWords.map((word) => {
        // Randomly select a syllable to ask about
        const randomSyllableIndex = Math.floor(Math.random() * word.syllables.length)
        const targetSyllable = word.syllables[randomSyllableIndex]

        return {
          word: word.word,
          image_url: word.image_url,
          target_syllable: targetSyllable,
          syllable_index: randomSyllableIndex,
          all_syllables: word.syllables,
        }
      })

      setQuestions(generatedQuestions)
      setLoading(false)
      setGameStarted(true)
    } catch (error) {
      console.error("Error generating questions:", error)
      Alert.alert("Error", "Failed to generate questions.")
      setDifficulty(null)
    }
  }

  // Generate multiple choice options for a question
  const generateOptions = (question) => {
    if (!question || !difficulty) return

    // Start with the correct answer
    const correctOption = question.target_syllable.text

    // Get all syllables from all words in the current difficulty
    const allSyllables = WORD_DATA[difficulty]?.flatMap((word) => word.syllables.map((s) => s.text)) || []

    // Filter out the correct answer and remove duplicates
    const uniqueSyllables = [...new Set(allSyllables.filter((s) => s !== correctOption))]

    // Shuffle and take 3 wrong options
    const wrongOptions = uniqueSyllables.sort(() => Math.random() - 0.5).slice(0, 3)

    // Combine correct and wrong options, then shuffle
    const allOptions = [correctOption, ...wrongOptions].sort(() => Math.random() - 0.5)

    setOptions(allOptions)
  }

  // Preload audio for a question
  const preloadAudio = async (question) => {
    if (!question) return;
    
    try {
      // Unload previous audio if it exists
      if (syllableSoundRef.current) {
        const status = await syllableSoundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await syllableSoundRef.current.unloadAsync();
        }
      }

      // Load new audio
      const { sound } = await Audio.Sound.createAsync(
        question.target_syllable.audio_url,
        { volume: 1.0 }
      );
      syllableSoundRef.current = sound;
    } catch (error) {
      console.error("Error preloading syllable audio:", error);
      syllableSoundRef.current = null;
    }
  }

  // Play the full word using Speech API
  const playFullWordAudio = async () => {
    if (isPlaying || isSpeaking) return

    try {
      setIsSpeaking(true)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      // Stop any ongoing speech
      await Speech.stop()

      // Configure speech options for clear pronunciation
      const options = {
        language: "en-US",
        pitch: 1.0,
        rate: 0.75, // Slower rate for clearer pronunciation
        onDone: () => {
          setIsSpeaking(false)
        },
        onError: (error) => {
          console.error("Speech error:", error)
          setIsSpeaking(false)
        },
      }

      // Speak the word
      Speech.speak(currentQuestion.word, options)
    } catch (error) {
      console.error("Error playing word with Speech API:", error)
      setIsSpeaking(false)
    }
  }

  // Play the target syllable audio
  const playSyllableAudio = async () => {
    if (isPlaying || isSpeaking || !syllableSoundRef.current) return;

    try {
      setIsPlaying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const status = await syllableSoundRef.current.getStatusAsync();
      if (status.isLoaded) {
        await syllableSoundRef.current.setPositionAsync(0);
        await syllableSoundRef.current.playAsync();
        
        // Wait for sound to finish
        syllableSoundRef.current.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      } else {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error playing syllable audio:", error);
      setIsPlaying(false);
    }
  }

  // Handle option selection
  const handleSelectOption = (option) => {
    if (selectedOption !== null || isPlaying || isSpeaking) return

    setSelectedOption(option)
    const isCorrect = option === currentQuestion.target_syllable.text

    if (isCorrect) {
      handleCorrectAnswer()
    } else {
      handleIncorrectAnswer()
    }
  }

  // Handle correct answer
  const handleCorrectAnswer = async () => {
    setScore(score + 1)
    setShowSuccess(true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    try {
      if (correctSoundRef.current) {
        try {
          if (typeof correctSoundRef.current.getStatusAsync === 'function') {
            const status = await correctSoundRef.current.getStatusAsync();
            if (status.isLoaded) {
              if (typeof correctSoundRef.current.setPositionAsync === 'function') {
                await correctSoundRef.current.setPositionAsync(0);
              }
              if (typeof correctSoundRef.current.playAsync === 'function') {
                await correctSoundRef.current.playAsync();
              }
            }
          }
        } catch (soundError) {
          console.log("Error with correct sound, continuing:", soundError);
        }
      }
    } catch (error) {
      console.error("Error playing correct sound:", error);
    }

    setTimeout(() => {
      setShowSuccess(false)
      setSelectedOption(null)
      moveToNextQuestion()
    }, 1500)
  }

  // Handle incorrect answer
  const handleIncorrectAnswer = async () => {
    setShowFailure(true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)

    try {
      if (incorrectSoundRef.current) {
        try {
          if (typeof incorrectSoundRef.current.getStatusAsync === 'function') {
            const status = await incorrectSoundRef.current.getStatusAsync();
            if (status.isLoaded) {
              if (typeof incorrectSoundRef.current.setPositionAsync === 'function') {
                await incorrectSoundRef.current.setPositionAsync(0);
              }
              if (typeof incorrectSoundRef.current.playAsync === 'function') {
                await incorrectSoundRef.current.playAsync();
              }
            }
          }
        } catch (soundError) {
          console.log("Error with incorrect sound, continuing:", soundError);
        }
      }
    } catch (error) {
      console.error("Error handling incorrect answer:", error);
    }

    setTimeout(() => {
      setShowFailure(false)
      moveToNextQuestion()
    }, 1500)
  }

  // Move to the next question or end the game
  const moveToNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Game is complete
      try {
        // First play a success haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Wait a moment before showing the summary
        setTimeout(async () => {
          await updateHighScore(score)
          setGameComplete(true)
        }, 1000)
      } catch (error) {
        console.error("Error processing game completion:", error)
        
        // Ensure we still show the game summary even if sound fails
        await updateHighScore(score)
        setGameComplete(true)
      }
    }
  }

  // Handle end game button
  const handleEndGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    Alert.alert("End Game", "Are you sure you want to end the game?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "End Game",
        onPress: async () => {
          try {
            // Stop any ongoing speech
            await Speech.stop()
            
            // Give user feedback with haptics instead of sound
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            // Short delay then show summary
            setTimeout(async () => {
              await updateHighScore(score)
              setGameComplete(true)
            }, 500)
          } catch (error) {
            console.error("Error ending game:", error)
            await updateHighScore(score)
            setGameComplete(true)
          }
        },
      },
    ])
  }

  // Reset the game
  const resetGame = () => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setSelectedOption(null)
    setShowSuccess(false)
    setShowFailure(false)
    setGameComplete(false)
    // Generate new questions
    generateQuestions()
  }

  // Handle play again button
  const handlePlayAgain = () => {
    resetGame()
  }

  // Handle change difficulty button
  const handleChangeDifficulty = () => {
    setDifficulty(null)
    setGameStarted(false)
    setGameComplete(false)
    resetGame()
  }

  // Handle start game button
  const handleStartGame = () => {
    setShowSplash(false)
  }

  // Render splash screen
  if (showSplash) {
    return <PhonicsSplashScreen onStartGame={handleStartGame} onBackToHome={onBackToHome} />
  }

  // Render difficulty selection
  if (!difficulty) {
    return <PhonicsDifficultySelect onSelectDifficulty={setDifficulty} onBackToHome={onBackToHome} />
  }

  // Render loading screen
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
          <Text style={styles.loadingText}>Loading phonics game...</Text>
        </View>
      </ImageBackground>
    )
  }

  // Render game summary
  if (gameComplete) {
    return (
      <PhonicsGameSummary
        score={score}
        totalQuestions={questions.length}
        difficulty={difficulty}
        highScore={highScore}
        onPlayAgain={handlePlayAgain}
        onChangeDifficulty={handleChangeDifficulty}
        onBackToHome={onBackToHome}
      />
    )
  }

  // Render main game
  return (
    <ImageBackground source={require("./assets/images/game-screen-bg.jpg")} style={styles.container}>
      <PirateAudio />

      <View style={styles.overlay}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[styles.progressFill, { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>

        {currentQuestion && (
          <View style={styles.gameContent}>
            <Text style={styles.questionText}>What sound do ye hear, matey?</Text>

            {/* Word image */}
            <ImageBackground
              source={require("./assets/images/wooden-frame.png")}
              style={styles.woodenFrame}
              resizeMode="stretch"
            >
              <Image source={currentQuestion.image_url} style={styles.wordImage} resizeMode="contain" />
            </ImageBackground>

            {/* Audio buttons */}
            <View style={styles.audioButtonsContainer}>
              <TouchableOpacity
                style={styles.audioButton}
                onPress={playFullWordAudio}
                disabled={isPlaying || isSpeaking}
                activeOpacity={0.7}
              >
                <ImageBackground
                  source={require("./assets/images/wooden-button.png")}
                  style={styles.pirateButton}
                  resizeMode="stretch"
                >
                  <Text style={styles.audioButtonText}>{isSpeaking ? "Speaking..." : "Play Word"}</Text>
                </ImageBackground>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.audioButton}
                onPress={playSyllableAudio}
                disabled={isPlaying || isSpeaking}
                activeOpacity={0.7}
              >
                <ImageBackground
                  source={require("./assets/images/wooden-button.png")}
                  style={styles.pirateButton}
                  resizeMode="stretch"
                >
                  <Text style={styles.audioButtonText}>{isPlaying ? "Playing..." : "Play Sound"}</Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>

            {/* Answer options */}
            <View style={styles.optionsContainer}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedOption === option &&
                      (option === currentQuestion.target_syllable.text ? styles.correctOption : styles.incorrectOption),
                  ]}
                  onPress={() => handleSelectOption(option)}
                  disabled={selectedOption !== null || isPlaying || isSpeaking}
                  activeOpacity={0.7}
                >
                  <ImageBackground
                    source={require("./assets/images/jungle-splash.jpg")}
                    style={styles.optionBackground}
                    resizeMode="stretch"
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </View>

            {/* End game button */}
            <TouchableOpacity style={styles.endGameButton} onPress={handleEndGame} activeOpacity={0.7}>
              <ImageBackground
                source={require("./assets/images/wooden-button-small.png")}
                style={styles.pirateButtonSmall}
                resizeMode="stretch"
              >
                <Text style={styles.endGameButtonText}>Abandon Ship</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        )}

        {/* Success animation */}
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

        {/* Failure animation */}
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
  progressContainer: {
    width: "100%",
    marginBottom: 20,
  },
  progressBackground: {
    height: 15,
    backgroundColor: "#8B4513",
    borderColor: "#3E2723",
    borderWidth: 3,
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 10,
  },
  progressText: {
    fontSize: 16,
    fontFamily: "OpenDyslexic",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
    textAlign: "center",
    marginTop: 5,
  },
  scoreText: {
    fontSize: 20,
    fontFamily: "OpenDyslexic-Bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
    textAlign: "center",
    marginTop: 5,
  },
  gameContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  questionText: {
    fontSize: Math.min(width * 0.06, 28),
    fontFamily: "OpenDyslexic-Bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.85)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: height * 0.02,
    textAlign: "center",
  },
  woodenFrame: {
    width: Math.min(width * 0.9, 400),
    height: Math.min(height * 0.25, 200),
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginVertical: height * 0.02,
  },
  wordImage: {
    width: "80%",
    height: "80%",
    borderRadius: 10,
  },
  audioButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: height * 0.02,
  },
  audioButton: {
    width: Math.min(width * 0.4, 180),
    height: Math.min(height * 0.08, 60),
  },
  pirateButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  audioButtonText: {
    color: "#3E2723",
    fontSize: Math.min(width * 0.04, 18),
    fontFamily: "OpenDyslexic-Bold",
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: height * 0.02,
  },
  optionButton: {
    width: Math.min(width * 0.4, 180),
    height: Math.min(height * 0.1, 80),
    margin: 5,
  },
  optionBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    color: "#3E2723",
    fontSize: Math.min(width * 0.05, 24),
    fontFamily: "OpenDyslexic-Bold",
    textAlign: "center",
  },
  correctOption: {
    borderWidth: 3,
    borderColor: "#4CAF50",
    borderRadius: 10,
  },
  incorrectOption: {
    borderWidth: 3,
    borderColor: "#F44336",
    borderRadius: 10,
  },
  endGameButton: {
    width: Math.min(width * 0.5, 200),
    height: Math.min(height * 0.06, 50),
    marginTop: height * 0.02,
  },
  pirateButtonSmall: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  endGameButtonText: {
    color: "#3E2723",
    fontSize: Math.min(width * 0.04, 16),
    fontFamily: "OpenDyslexic",
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

