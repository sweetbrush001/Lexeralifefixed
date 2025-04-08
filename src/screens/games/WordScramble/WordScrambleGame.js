import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Animated, 
  Keyboard, 
  ScrollView, 
  ImageBackground,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modal';

const WordScrambleGame = ({ navigation, route }) => {
  // Game parameters
  const params = route.params || {};
  const initialLevel = params.level || 'Easy';
  
  // Game state
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isHintModalVisible, setIsHintModalVisible] = useState(false);
  const [level, setLevel] = useState(initialLevel);
  const [isMuted, setIsMuted] = useState(false);
  const [sounds, setSounds] = useState({});
  const [isAudioReady, setIsAudioReady] = useState(false);

  // Refs
  const timerRef = React.useRef(null);
  const scoreAnimation = React.useRef(new Animated.Value(0)).current;
  const iconPosition = React.useRef(new Animated.Value(0)).current;

  // Initialize audio system
  useEffect(() => {
    let isMounted = true;
    
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        });

        const loadedSounds = {};
        const soundFiles = {
          correct: require('../assets/sounds/wordScramble/correct.mp3'),
          incorrect: require('../assets/sounds/wordScramble/error.mp3'),
          check: require('../assets/sounds/wordScramble/check.mp3'),
          hint: require('../assets/sounds/wordScramble/hint.mp3'),
          skip: require('../assets/sounds/wordScramble/skip.mp3'),
          complete: require('../assets/sounds/wordScramble/level-complete.mp3'),
        };

        for (const [key, file] of Object.entries(soundFiles)) {
          try {
            const soundObject = new Audio.Sound();
            await soundObject.loadAsync(file);
            loadedSounds[key] = soundObject;
          } catch (error) {
            console.error(`Error loading sound ${key}:`, error);
          }
        }

        if (isMounted) {
          setSounds(loadedSounds);
          setIsAudioReady(true);
        }
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        if (isMounted) {
          setIsAudioReady(false);
        }
      }
    };
    
    setupAudio();
    
    return () => {
      isMounted = false;
      // Cleanup sounds
      Object.values(sounds).forEach(sound => {
        if (sound) {
          sound.unloadAsync().catch(console.error);
        }
      });
    };
  }, []);

  // Play sound with proper error handling
  const playSound = async (soundType) => {
    if (isMuted || !isAudioReady || !sounds[soundType]) {
      console.log(`Sound ${soundType} not played: muted=${isMuted}, ready=${isAudioReady}`);
      return;
    }
    
    try {
      const soundObject = sounds[soundType];
      const status = await soundObject.getStatusAsync();
      
      if (status.isLoaded) {
        // Stop if already playing
        if (status.isPlaying) {
          await soundObject.stopAsync();
        }
        // Replay from start
        await soundObject.replayAsync();
      }
    } catch (error) {
      console.error(`Error playing ${soundType} sound:`, error);
    }
  };

  // Toggle mute function
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Game utility functions
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const scrambleWord = (word) => {
    const wordArray = word.split('');
    let scrambled = word;

    while (scrambled === word) {
      for (let i = wordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
      }
      scrambled = wordArray.join('');
    }

    return scrambled;
  };

  const getTimeLimit = () => {
    switch (level.toLowerCase()) {
      case 'easy': return 20;
      case 'medium': return 15;
      case 'hard': return 10;
      default: return 15;
    }
  };

  const getBackgroundImage = () => {
    switch (level.toLowerCase()) {
      case 'easy': return require('../assets/images/wordScramble/easy-background.webp');
      case 'medium': return require('../assets/images/wordScramble/medium-background.webp');
      case 'hard': return require('../assets/images/.wordScramblehard-background.webp');
      default: return require('../assets/images/wordScramble/default-background.png');
    }
  };

  // Load words from storage
  useEffect(() => {
    const loadWords = async () => {
      try {
        const storedWords = await AsyncStorage.getItem(`${level.toLowerCase()}Words`);
        if (storedWords) {
          const parsedWords = JSON.parse(storedWords);
          const shuffledWords = shuffleArray(parsedWords);
          setWords(shuffledWords);

          if (shuffledWords.length > 0) {
            const word = shuffledWords[0];
            setCurrentWord(word);
            setScrambledWord(scrambleWord(word));
            setTimeLeft(getTimeLimit());
          }
        } else {
          // Default words
          const defaultWords = level.toLowerCase() === 'easy' 
            ? ['cat', 'dog', 'sun', 'hat', 'run', 'big', 'red', 'box', 'cup', 'pen'] 
            : level.toLowerCase() === 'medium'
              ? ['apple', 'house', 'table', 'chair', 'water', 'paper', 'music', 'happy', 'plant', 'light']
              : ['banana', 'garden', 'window', 'family', 'school', 'orange', 'purple', 'friend', 'pencil', 'summer'];
          
          const shuffledWords = shuffleArray(defaultWords);
          setWords(shuffledWords);
          
          if (shuffledWords.length > 0) {
            const word = shuffledWords[0];
            setCurrentWord(word);
            setScrambledWord(scrambleWord(word));
            setTimeLeft(getTimeLimit());
          }
          
          await AsyncStorage.setItem(`${level.toLowerCase()}Words`, JSON.stringify(defaultWords));
        }
      } catch (error) {
        console.error('Error loading words:', error);
      }
    };

    loadWords();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [level]);

  // Game timer
  useEffect(() => {
    if (words.length > 0 && !gameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
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

  // Animation effects
  useEffect(() => {
    Animated.timing(iconPosition, {
      toValue: (timeLeft / getTimeLimit()) * 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  // Game actions
  const handleTimeUp = () => {
    if (currentWordIndex < words.length - 1) {
      moveToNextWord();
    } else {
      endGame();
    }
  };

  const moveToNextWord = () => {
    const nextIndex = currentWordIndex + 1;
    setCurrentWordIndex(nextIndex);
    setCurrentWord(words[nextIndex]);
    setScrambledWord(scrambleWord(words[nextIndex]));
    setUserInput('');
    setHintUsed(false);
    setTimeLeft(getTimeLimit());
  };

  const endGame = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameOver(true);

    try {
      const scoreKey = `${level.toLowerCase()}Scores`;
      const storedScores = await AsyncStorage.getItem(scoreKey);
      const scores = storedScores ? JSON.parse(storedScores) : [];
      
      const newScore = {
        score,
        date: new Date().toISOString(),
        username: 'Player'
      };
      
      scores.push(newScore);
      scores.sort((a, b) => b.score - a.score);
      
      await AsyncStorage.setItem(scoreKey, JSON.stringify(scores.slice(0, 10)));
    } catch (error) {
      console.error('Error saving score:', error);
    }

    await playSound('complete');

    Alert.alert(
      'Game Over!',
      `Your final score: ${score}`,
      [
        { 
          text: 'See Scoreboard', 
          onPress: () => navigation.navigate('Scoreboard') 
        },
        {
          text: 'Play Again',
          onPress: () => {
            setGameOver(false);
            setCurrentWordIndex(0);
            setScore(0);
            setHintUsed(false);
            const shuffledWords = shuffleArray(words);
            setWords(shuffledWords);
            setCurrentWord(shuffledWords[0]);
            setScrambledWord(scrambleWord(shuffledWords[0]));
            setTimeLeft(getTimeLimit());
          }
        },
        { 
          text: 'Back to Games', 
          onPress: () => navigation.navigate('Games') 
        }
      ]
    );
  };

  const checkAnswer = async () => {
    await playSound('check');
    if (userInput.toLowerCase() === currentWord.toLowerCase()) {
      await playSound('correct');
      const timeBonus = Math.floor(timeLeft * 10);
      const hintPenalty = hintUsed ? 50 : 0;
      const wordScore = 100 + timeBonus - hintPenalty;

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

      setScore(prev => prev + wordScore);

      if (currentWordIndex < words.length - 1) {
        moveToNextWord();
      } else {
        endGame();
      }
    } else {
      await playSound('incorrect');
      setIsModalVisible(true);
    }
  };

  const showHint = async () => {
    await playSound('hint');
    if (!hintUsed) {
      setIsHintModalVisible(true);
      setHintUsed(true);
    } else {
      Alert.alert('Hint Already Used', "You've already used your hint for this word.");
    }
  };

  const skipWord = async () => {
    await playSound('skip');
    setScore(prev => Math.max(0, prev - 25));

    if (currentWordIndex < words.length - 1) {
      moveToNextWord();
    } else {
      endGame();
    }
  };

  // Animation styles
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

  const iconAnimationStyle = {
    transform: [
      {
        translateX: iconPosition.interpolate({
          inputRange: [0, 100],
          outputRange: ['100%', '0%'],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
                        backgroundColor: timeLeft < 5 ? '#F44336' : '#4CAF50',
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
        
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={30} color="white" />
        </TouchableOpacity>
        
        <Modal isVisible={isModalVisible}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Oops!</Text>
            <Text style={styles.modalSubText}>That's not right. Try again!</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        
        <Modal isVisible={isHintModalVisible}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Hint</Text>
            <Text style={styles.modalSubText}>The word starts with "{currentWord[0]}"</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setIsHintModalVisible(false)}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Styles remain the same as in your original code
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  gameInfo: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  levelText: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 26,
    color: '#E0B0FF',
    marginBottom: 5,
  },
  scoreText: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 22,
    color: 'white',
    marginBottom: 5,
  },
  progressText: {
    fontFamily: 'OpenDyslexic',
    fontSize: 18,
    color: '#d1a7e7',
  },
  timerContainer: {
    marginBottom: 30,
  },
  timerText: {
    fontFamily: 'OpenDyslexic',
    fontSize: 18,
    color: '#D284E4',
    marginBottom: 5,
  },
  timerBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  timerProgress: {
    height: '100%',
    borderRadius: 5,
  },
  gameArea: {
    alignItems: 'center',
    backgroundColor: '#3F1563',
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionText: {
    fontFamily: 'OpenDyslexic',
    fontSize: 18,
    color: '#DA90E7',
    marginBottom: 15,
  },
  scrambledWord: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 24,
    color: '#6A24FE',
    letterSpacing: 5,
    marginBottom: 25,
  },
  input: {
    fontFamily: 'OpenDyslexic',
    fontSize: 24,
    width: '100%',
    padding: 15,
    borderWidth: 2,
    borderColor: '#6A24FE',
    borderRadius: 10,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 3,
    color: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  checkButton: {
    backgroundColor: '#4CAF50',
  },
  hintButton: {
    backgroundColor: '#2196F3',
  },
  skipButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 15,
    color: 'white',
  },
  muteButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'OpenDyslexic',
    fontSize: 18,
    color: '#666',
  },
  modalContent: {
    backgroundColor: '#E0B0FF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 24,
    color: '#3F1563',
    marginBottom: 10,
  },
  modalSubText: {
    fontFamily: 'OpenDyslexic',
    fontSize: 18,
    color: '#3F1563',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 18,
    color: 'white',
  },
});

export default WordScrambleGame;