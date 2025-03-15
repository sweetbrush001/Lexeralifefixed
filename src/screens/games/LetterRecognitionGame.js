import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

// Import TextReaderRoot and ReadableText for accessibility
import TextReaderRoot from '../../components/TextReaderRoot';
import ReadableText from '../../components/ReadableText';

// Import useTextStyle hook for applying text styling from settings
import { useTextStyle } from '../../hooks/useTextStyle';

const { width, height } = Dimensions.get('window');

// Letter data with confusing pairs for dyslexic users
const letterData = [
  // Level 1: Basic letters
  [
    { letter: 'A', options: ['A', 'E', 'H', 'R'], correct: 'A' },
    { letter: 'B', options: ['B', 'D', 'P', 'R'], correct: 'B' },
    { letter: 'C', options: ['C', 'G', 'O', 'Q'], correct: 'C' },
    { letter: 'D', options: ['D', 'B', 'P', 'Q'], correct: 'D' },
    { letter: 'E', options: ['E', 'F', 'A', '3'], correct: 'E' },
  ],
  // Level 2: Commonly confused letters
  [
    { letter: 'b', options: ['b', 'd', 'p', 'q'], correct: 'b' },
    { letter: 'd', options: ['d', 'b', 'p', 'q'], correct: 'd' },
    { letter: 'p', options: ['p', 'b', 'd', 'q'], correct: 'p' },
    { letter: 'q', options: ['q', 'b', 'd', 'p'], correct: 'q' },
    { letter: 'm', options: ['m', 'n', 'w', 'u'], correct: 'm' },
  ],
  // Level 3: More challenging
  [
    { letter: 'g', options: ['g', 'j', 'y', 'q'], correct: 'g' },
    { letter: 'i', options: ['i', 'j', 'l', '1'], correct: 'i' },
    { letter: 'n', options: ['n', 'm', 'h', 'u'], correct: 'n' },
    { letter: 's', options: ['s', 'z', '5', '2'], correct: 's' },
    { letter: 'w', options: ['w', 'v', 'u', 'm'], correct: 'w' },
  ],
  // Level 4: Letter combinations
  [
    { letter: 'th', options: ['th', 'ht', 'ch', 'sh'], correct: 'th' },
    { letter: 'sh', options: ['sh', 'ch', 'hs', 'sz'], correct: 'sh' },
    { letter: 'ch', options: ['ch', 'sh', 'hc', 'ck'], correct: 'ch' },
    { letter: 'wh', options: ['wh', 'hw', 'wy', 'wn'], correct: 'wh' },
    { letter: 'ph', options: ['ph', 'hp', 'pf', 'fp'], correct: 'ph' },
  ],
  // Level 5: Expert level - reversed and rotated letters
  [
    { letter: 'b', options: ['b', 'ᗺ', 'ᑫ', 'ᗡ'], correct: 'b' },
    { letter: 'd', options: ['d', 'ᗷ', 'ᗞ', 'ᑫ'], correct: 'd' },
    { letter: 'p', options: ['p', 'ᑫ', 'ᗞ', 'ᗺ'], correct: 'p' },
    { letter: 'q', options: ['q', 'ᗞ', 'ᗺ', 'ᑫ'], correct: 'q' },
    { letter: 'n', options: ['n', 'u', 'ᴎ', 'ꓵ'], correct: 'n' },
  ],
];

const LetterRecognitionGame = () => {
  const navigation = useNavigation();
  const textStyle = useTextStyle();
  const [level, setLevel] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timedMode, setTimedMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30); // 30 seconds per level
  const [gameActive, setGameActive] = useState(false);
  const [streakCount, setStreakCount] = useState(0); // Track consecutive correct answers
  
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  
  // Current question
  const currentQuestion = letterData[level]?.[currentQuestionIndex];
  
  // Reset game when level changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setShowFeedback(false);
    setIsCorrect(false);
    setSelectedOption(null);
    
    // Reset timer when level changes
    if (timedMode) {
      setTimeRemaining(30);
      setGameActive(true);
    }
  }, [level, timedMode]);
  
  // Timer effect for timed mode
  useEffect(() => {
    if (timedMode && gameActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timedMode && gameActive && timeRemaining === 0) {
      // Time's up
      setGameActive(false);
      Alert.alert(
        "Time's Up!",
        `You scored ${score} points in timed mode!`,
        [
          { 
            text: "Try Again", 
            onPress: () => {
              setTimeRemaining(30);
              setGameActive(true);
              setCurrentQuestionIndex(0);
            }
          },
          {
            text: "Switch to Regular Mode",
            onPress: () => {
              setTimedMode(false);
              setLevel(0);
              setScore(0);
            },
            style: "cancel"
          }
        ]
      );
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timedMode, gameActive, timeRemaining]);
  
  // Clean up Speech and animations when component unmounts
  // THIS WAS OUTSIDE THE COMPONENT BODY - MOVED IT INSIDE
  useEffect(() => {
    return () => {
      Speech.stop();
      bounceAnim.setValue(1);
      shakeAnim.setValue(0);
      fadeAnim.setValue(1);
    };
  }, []);
  
  const handleOptionPress = (option) => {
    // Ignore if feedback is showing or game is not active in timed mode
    if (showFeedback || (timedMode && !gameActive)) return;
    
    setSelectedOption(option);
    setAttempts(attempts + 1);
    
    if (option === currentQuestion.correct) {
      // Correct answer
      setIsCorrect(true);
      
      // Update streak count
      const newStreakCount = streakCount + 1;
      setStreakCount(newStreakCount);
      
      // Calculate score with streak bonus
      const streakBonus = Math.min(Math.floor(newStreakCount / 3), 5) * 5; // +5 points for every 3 correct answers, max +25
      const timedBonus = timedMode ? 5 : 0; // Extra points for timed mode
      const pointsEarned = 10 + streakBonus + timedBonus;
      
      setScore(score + pointsEarned);
      
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Animate success
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Speak the letter
      Speech.speak(currentQuestion.letter, {
        language: 'en',
        pitch: 1,
        rate: 0.8,
      });
    } else {
      // Wrong answer
      setIsCorrect(false);
      setStreakCount(0); // Reset streak on wrong answer
      
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Shake animation for wrong answer
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Show feedback
    setShowFeedback(true);
    
    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < letterData[level].length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (level < letterData.length - 1) {
        // Level complete
        if (timedMode) {
          // Add time bonus for completing level in timed mode
          const timeBonus = timeRemaining * 2;
          setScore(score => score + timeBonus);
          
          Alert.alert(
            "Level Complete!",
            `You completed level ${level + 1} with a score of ${score}!\nTime Bonus: +${timeBonus}`,
            [
              { 
                text: "Next Level", 
                onPress: () => {
                  setLevel(level + 1);
                  setTimeRemaining(30); // Reset timer for next level
                }
              },
              {
                text: "Replay",
                onPress: () => {
                  setCurrentQuestionIndex(0);
                  setTimeRemaining(30); // Reset timer
                },
                style: "cancel"
              }
            ]
          );
        } else {
          Alert.alert(
            "Level Complete!",
            `You completed level ${level + 1} with a score of ${score}!`,
            [
              { 
                text: "Next Level", 
                onPress: () => {
                  setLevel(level + 1);
                }
              },
              {
                text: "Replay",
                onPress: () => {
                  setCurrentQuestionIndex(0);
                },
                style: "cancel"
              }
            ]
          );
        }
      } else {
        // Game complete
        Alert.alert(
          "Game Complete!",
          `Congratulations! You've completed all levels with a final score of ${score}!`,
          [
            { 
              text: "Play Again", 
              onPress: () => {
                setLevel(0);
                setScore(0);
                setAttempts(0);
                if (timedMode) {
                  setTimeRemaining(30);
                  setGameActive(true);
                }
              }
            },
            {
              text: "Back to Games",
              onPress: () => navigation.goBack(),
              style: "cancel"
            }
          ]
        );
      }
      
      // Reset for next question
      setShowFeedback(false);
      setIsCorrect(false);
      setSelectedOption(null);
    }, 1500);
  };
  
  const speakLetter = () => {
    if (currentQuestion) {
      Speech.speak(currentQuestion.letter, {
        language: 'en',
        pitch: 1,
        rate: 0.8,
      });
    }
  };
  
  return (
    <TextReaderRoot>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#FF6B6B" />
          </TouchableOpacity>
          <ReadableText style={styles.headerTitle} readable={true} priority={1}>
            Letter Recognition
          </ReadableText>
          <View style={styles.placeholder} />
        </View>
        
        {/* Game Info */}
        <View style={styles.gameInfo}>
          <Animated.View 
            style={[styles.scoreContainer, { transform: [{ scale: bounceAnim }] }]}
          >
            <ReadableText style={styles.scoreLabel} readable={true} priority={2}>
              Score
            </ReadableText>
            <ReadableText style={styles.scoreValue} readable={true} priority={3}>
              {score}
            </ReadableText>
          </Animated.View>
          
          <View style={styles.levelContainer}>
            <ReadableText style={styles.levelLabel} readable={true} priority={4}>
              Level
            </ReadableText>
            <ReadableText style={styles.levelValue} readable={true} priority={5}>
              {level + 1}
            </ReadableText>
          </View>
          
          {/* Streak Counter */}
          {streakCount > 0 && (
            <View style={styles.streakContainer}>
              <ReadableText style={styles.streakLabel} readable={true} priority={6}>
                Streak
              </ReadableText>
              <ReadableText style={styles.streakValue} readable={true} priority={7}>
                {streakCount}🔥
              </ReadableText>
            </View>
          )}
          
          {/* Timer for Timed Mode */}
          {timedMode && (
            <View style={[styles.timerContainer, timeRemaining < 10 ? styles.timerWarning : null]}>
              <ReadableText style={styles.timerLabel} readable={true} priority={8}>
                Time
              </ReadableText>
              <ReadableText style={styles.timerValue} readable={true} priority={9}>
                {timeRemaining}s
              </ReadableText>
            </View>
          )}
        </View>
        
        {/* Mode Toggle */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity 
            style={[styles.modeButton, !timedMode && styles.modeButtonActive]}
            onPress={() => {
              if (timedMode) {
                setTimedMode(false);
                setLevel(0);
                setScore(0);
                setCurrentQuestionIndex(0);
              }
            }}
          >
            <ReadableText style={styles.modeButtonText} readable={true} priority={10}>
              Regular Mode
            </ReadableText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modeButton, timedMode && styles.modeButtonActive]}
            onPress={() => {
              if (!timedMode) {
                setTimedMode(true);
                setTimeRemaining(30);
                setGameActive(true);
                setLevel(0);
                setScore(0);
                setCurrentQuestionIndex(0);
              }
            }}
          >
            <ReadableText style={styles.modeButtonText} readable={true} priority={11}>
              Timed Mode
            </ReadableText>
          </TouchableOpacity>
        </View>
        
        {/* Game Instructions */}
        <LinearGradient
          colors={['#FF9F9F', '#FF6B6B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.instructionsCard}
        >
          <ReadableText style={styles.instructionsText} readable={true} priority={6}>
            Listen to the letter sound and select the correct letter from the options below.
          </ReadableText>
        </LinearGradient>
        
        {/* Letter Display */}
        {currentQuestion && (
          <View style={styles.questionContainer}>
            <Animated.View 
              style={[styles.letterDisplay, { transform: [{ translateX: shakeAnim }] }]}
            >
              <ReadableText 
                style={[styles.letterText, textStyle]} 
                readable={true} 
                priority={7}
              >
                {currentQuestion.letter}
              </ReadableText>
              
              {/* Visual cues for dyslexic users */}
              {['b', 'd', 'p', 'q'].includes(currentQuestion.letter) && (
                <View style={styles.letterHelpContainer}>
                  <ReadableText style={styles.letterHelpText} readable={true} priority={14}>
                    {currentQuestion.letter === 'b' && '← This letter faces left'}
                    {currentQuestion.letter === 'd' && 'This letter faces right →'}
                    {currentQuestion.letter === 'p' && '← This letter has a tail down'}
                    {currentQuestion.letter === 'q' && 'This letter has a tail down →'}
                  </ReadableText>
                </View>
              )}
            </Animated.View>
            
            <TouchableOpacity 
              style={styles.speakButton}
              onPress={speakLetter}
            >
              <Feather name="volume-2" size={24} color="#FF6B6B" />
              <ReadableText style={styles.speakButtonText} readable={true} priority={8}>
                Hear Letter
              </ReadableText>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Options */}
        {currentQuestion && (
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOption === option && (isCorrect ? styles.correctOption : styles.wrongOption),
                  showFeedback && option === currentQuestion.correct && styles.correctOption
                ]}
                onPress={() => handleOptionPress(option)}
                disabled={showFeedback}
              >
                <ReadableText 
                  style={[styles.optionText, textStyle]} 
                  readable={true} 
                  priority={9 + index}
                >
                  {option}
                </ReadableText>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Feedback */}
        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <ReadableText 
              style={[styles.feedbackText, isCorrect ? styles.correctFeedback : styles.wrongFeedback]} 
              readable={true} 
              priority={13}
            >
              {isCorrect ? 'Correct!' : 'Try Again!'}
            </ReadableText>
          </View>
        )}
      </SafeAreaView>
    </TextReaderRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 44,
  },
  gameInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: '45%',
    marginBottom: 10,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  levelContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: '45%',
    marginBottom: 10,
  },
  levelLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  levelValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  streakContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: '45%',
    marginBottom: 10,
  },
  streakLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  timerContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: '45%',
    marginBottom: 10,
  },
  timerWarning: {
    backgroundColor: '#FFECEC',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  timerLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  timerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  modeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  modeButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: width * 0.4,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#FF9F9F',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  instructionsCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    padding: 15,
  },
  instructionsText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  questionContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  letterDisplay: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 15,
  },
  letterText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  speakButtonText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginHorizontal: 10,
  },
  optionButton: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
  },
  correctOption: {
    backgroundColor: '#a8e6cf',
    borderWidth: 2,
    borderColor: '#69c596',
  },
  wrongOption: {
    backgroundColor: '#ffcac8',
    borderWidth: 2,
    borderColor: '#ff8b94',
  },
  feedbackContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  correctFeedback: {
    color: '#69c596',
  },
  wrongFeedback: {
    color: '#ff8b94',
  },
  letterHelpContainer: {
    marginTop: 10,
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FBC02D',
    maxWidth: width * 0.8,
  },
  letterHelpText: {
    fontSize: 14,
    color: '#5D4037',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LetterRecognitionGame;