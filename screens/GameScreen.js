import { useState, useEffect, useContext, useRef } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Animated, Keyboard, ScrollView, ImageBackground } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av"; // Import Audio from expo-av
import { AppContext } from "../context/AppContext";
import { SoundContext } from "../context/SoundContext"; // Import SoundContext
import Icon from 'react-native-vector-icons/FontAwesome'; // Import Icon from react-native-vector-icons
import Modal from 'react-native-modal'; // Import Modal from react-native-modal

const GameScreen = ({ route, navigation }) => {
  const { level } = route.params;
  const { addScore, scrambleWord, user } = useContext(AppContext); // Assuming user info is available in context
  const { isMuted, toggleMute } = useContext(SoundContext); // Use SoundContext

  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for "Try Again" modal visibility
  const [isHintModalVisible, setIsHintModalVisible] = useState(false); // State for hint modal visibility

  const timerRef = useRef(null);
  const scoreAnimation = useRef(new Animated.Value(0)).current;
  const iconPosition = useRef(new Animated.Value(0)).current;

  // Utility function to play a sound
  const playSound = async (soundFile) => {
    if (!isMuted) {
      try {
        const { sound } = await Audio.Sound.createAsync(soundFile);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    }
  };

  // Utility function to shuffle an array
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Set time limit based on difficulty
  const getTimeLimit = () => {
    switch (level.toLowerCase()) {
      case "easy":
        return 15;
      case "medium":
        return 20;
      case "hard":
        return 25;
      default:
        return 30;
    }
  };

  // Get background image based on level
  const getBackgroundImage = () => {
    switch (level.toLowerCase()) {
      case "easy":
        return require("../assets/images/easy-background.webp");
      case "medium":
        return require("../assets/images/medium-background.webp");
      case "hard":
        return require("../assets/images/hard-background.png");
      default:
        return require("../assets/images/default-background.png");
    }
  };

  // Load words from AsyncStorage
  useEffect(() => {
    const loadWords = async () => {
      try {
        const storedWords = await AsyncStorage.getItem(`${level.toLowerCase()}Words`);
        if (storedWords) {
          const parsedWords = JSON.parse(storedWords);
          const shuffledWords = shuffleArray(parsedWords); // Shuffle the words
          setWords(shuffledWords);

          // Set first word
          if (shuffledWords.length > 0) {
            const word = shuffledWords[0];
            setCurrentWord(word);
            setScrambledWord(scrambleWord(word));
            setTimeLeft(getTimeLimit());
          }
        }
      } catch (error) {
        console.error("Error loading words:", error);
      }
    };

    loadWords();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [level]);

  // Start timer
  useEffect(() => {
    if (words.length > 0 && !gameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up for this word
            handleTimeUp();
            return getTimeLimit();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [words, currentWordIndex, gameOver]);

  // Animate icon position based on time left
  useEffect(() => {
    Animated.timing(iconPosition, {
      toValue: (timeLeft / getTimeLimit()) * 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  // Handle time up for a word
  const handleTimeUp = () => {
    // Move to next word or end game
    if (currentWordIndex < words.length - 1) {
      moveToNextWord();
    } else {
      endGame();
    }
  };

  // Move to next word
  const moveToNextWord = () => {
    const nextIndex = currentWordIndex + 1;
    setCurrentWordIndex(nextIndex);
    setCurrentWord(words[nextIndex]);
    setScrambledWord(scrambleWord(words[nextIndex]));
    setUserInput("");
    setHintUsed(false);
    setTimeLeft(getTimeLimit());
  };

  // End the game
  const endGame = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameOver(true);

    // Save the score with the logged-in user's info
    if (user) {
      addScore(level.toLowerCase(), user.username, score); // Use `user.username` or `user.email`
    }

    // Play level completion sound
    await playSound(require("../assets/sounds/level-complete.mp3"));

    navigation.navigate("Scoreboard"); // Navigate to scoreboard
  };

  // Check user's answer
  const checkAnswer = async () => {
    await playSound(require("../assets/sounds/check.mp3"));
    if (userInput.toLowerCase() === currentWord.toLowerCase()) {
      // Correct answer
      await playSound(require("../assets/sounds/correct.mp3"));
      const timeBonus = Math.floor(timeLeft * 10);
      const hintPenalty = hintUsed ? 50 : 0;
      const wordScore = 100 + timeBonus - hintPenalty;

      // Animate score
      Animated.sequence([
        Animated.timing(scoreAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scoreAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setScore((prevScore) => prevScore + wordScore);

      // Move to next word or end game
      if (currentWordIndex < words.length - 1) {
        moveToNextWord();
      } else {
        endGame();
      }
    } else {
      // Wrong answer - shake input or show message
      await playSound(require("../assets/sounds/error.mp3"));
      setIsModalVisible(true); // Show modal
    }
  };

  // Show hint
  const showHint = async () => {
    await playSound(require("../assets/sounds/hint.mp3"));
    if (!hintUsed) {
      setIsHintModalVisible(true); // Show hint modal
      setHintUsed(true);
    } else {
      Alert.alert("Hint Already Used", "You've already used your hint for this word.");
    }
  };

  // Skip current word
  const skipWord = async () => {
    await playSound(require("../assets/sounds/skip.mp3"));
    // Penalty for skipping
    setScore((prevScore) => Math.max(0, prevScore - 25));

    // Move to next word or end game
    if (currentWordIndex < words.length - 1) {
      moveToNextWord();
    } else {
      endGame();
    }
  };

  // Score animation style
  const scoreAnimationStyle = {
    transform: [
      {
        scale: scoreAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.3],
        }),
      },
    ],
    opacity: scoreAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.8, 1],
    }),
  };

  // Icon animation style
  const iconAnimationStyle = {
    transform: [
      {
        translateX: iconPosition.interpolate({
          inputRange: [0, 100],
          outputRange: ["100%", "0%"],
        }),
      },
    ],
  };

  return (
    <ImageBackground source={getBackgroundImage()} style={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.container} onTouchStart={Keyboard.dismiss}>
        {words.length > 0 ? (
          <>
            <View style={styles.gameInfo}>
              <Text style={styles.levelText}>{level} Level</Text>
              <Animated.Text style={[styles.scoreText, scoreAnimationStyle]}>Score: {score}</Animated.Text>
              <Text style={styles.progressText}>
                Word {currentWordIndex + 1} of {words.length}
              </Text>
            </View>

            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>Time: {timeLeft}s</Text>
              <View style={styles.timerBar}>
                <View
                  style={[
                    styles.timerProgress,
                    {
                      width: `${(timeLeft / getTimeLimit()) * 100}%`,
                      backgroundColor: timeLeft < 5 ? "#F44336" : "#4CAF50",
                    },
                  ]}
                />
                
              </View>
            </View>

            <View style={styles.gameArea}>
              <Text style={styles.instructionText}>Unscramble this word:</Text>
              <Text style={styles.scrambledWord}>{scrambledWord}</Text>

              <TextInput
                style={styles.input}
                value={userInput}
                onChangeText={setUserInput}
                placeholder="Type your answer"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={currentWord.length}
                onSubmitEditing={checkAnswer}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, styles.checkButton]} onPress={checkAnswer}>
                  <Text style={styles.buttonText}>Check</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.hintButton, hintUsed && styles.disabledButton]}
                  onPress={showHint}
                  disabled={hintUsed}
                >
                  <Text style={styles.buttonText}>Hint</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.skipButton]} onPress={skipWord}>
                  <Text style={styles.buttonText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading words...</Text>
          </View>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
        <Icon name={isMuted ? "volume-off" : "volume-up"} size={30} color="white" />
      </TouchableOpacity>
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>Oops!</Text>
          <Text style={styles.modalSubText}>Lost in orbit. Tap to retry!</Text>
          <TouchableOpacity style={styles.modalButton} onPress={() => setIsModalVisible(false)}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal isVisible={isHintModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>Cosmic Hint!</Text>
          <Text style={styles.modalSubText}>Think of a word starting with.."{currentWord[0]}"!</Text>
          <TouchableOpacity style={styles.modalButton} onPress={() => setIsHintModalVisible(false)}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  gameInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  levelText: {
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 26,
    color: "#E0B0FF",
    marginBottom: 5,
  },
  scoreText: {
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 22,
    color: "white",
    marginBottom: 5,
  },
  progressText: {
    fontFamily: "OpenDyslexic",
    fontSize: 18,
    color: "#d1a7e7",
  },
  timerContainer: {
    marginBottom: 30,
  },
  timerText: {
    fontFamily: "OpenDyslexic",
    fontSize: 18,
    color: "#D284E4",
    marginBottom: 5,
  },
  timerBar: {
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
    position: "relative",
  },
  timerProgress: {
    height: "100%",
    borderRadius: 5,
  },
  iconContainer: {
    position: "absolute",
    top: -15,
    right: 0,
  },
  icon: {
    fontSize: 20,
  },
  gameArea: {
    alignItems: "center",
    backgroundColor: "#3F1563",
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionText: {
    fontFamily: "OpenDyslexic",
    fontSize: 18,
    color: "#DA90E7",
    marginBottom: 15,
  },
  scrambledWord: {
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 24,
    color: "#6A24FE",
    letterSpacing: 5,
    marginBottom: 25,
  },
  input: {
    fontFamily: "OpenDyslexic",
    fontSize: 24,
    width: "100%",
    padding: 15,
    borderWidth: 2,
    borderColor: "#6A24FE",
    borderRadius: 10,
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 3,
    color: "white",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  checkButton: {
    backgroundColor: "#4CAF50",
  },
  hintButton: {
    backgroundColor: "#2196F3",
  },
  skipButton: {
    backgroundColor: "#F44336",
  },
  disabledButton: {
    backgroundColor: "#BDBDBD",
  },
  buttonText: {
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 15,
    color: "white",
  },
  muteButton: {
    position: "absolute",
    top: 35,
    right: 20,
    backgroundColor: "transparent",
    padding: 3,
    borderRadius: 8,
    borderColor: "white",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "OpenDyslexic",
    fontSize: 18,
    color: "#666",
  },
  modalContent: {
    backgroundColor: "#E0B0FF", // Light purple background
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 24,
    color: "#3F1563",
    marginBottom: 10,
  },
  modalSubText: {
    fontFamily: "OpenDyslexic",
    fontSize: 18,
    color: "#3F1563",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 18,
    color: "white",
  },
});

export default GameScreen;