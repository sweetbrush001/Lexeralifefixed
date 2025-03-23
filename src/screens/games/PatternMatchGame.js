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
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
// Import TextReaderRoot and ReadableText for accessibility
import TextReaderRoot from '../../components/TextReaderRoot';
import ReadableText from '../../components/ReadableText';

// Import useTextStyle hook for applying text styling from settings
import { useTextStyle } from '../../hooks/useTextStyle';

// Import pattern data
import { patternLevels } from '../../data/patternMatchData';

const { width, height } = Dimensions.get('window');

const PatternMatchGame = () => {
  const navigation = useNavigation();
  const textStyle = useTextStyle();
  const [level, setLevel] = useState(0);
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timedMode, setTimedMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds per level
  const [gameActive, setGameActive] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiAnimations, setConfettiAnimations] = useState([]);
  
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  
  // Current pattern
  const currentPattern = patternLevels[level]?.patterns[currentPatternIndex];
  
  // Reset game when level changes
  useEffect(() => {
    setCurrentPatternIndex(0);
    setShowFeedback(false);
    setIsCorrect(false);
    setSelectedOption(null);
    setShowExplanation(false);
    
    // Reset timer when level changes
    if (timedMode) {
      setTimeRemaining(60);
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
              setTimeRemaining(60);
              setGameActive(true);
              setCurrentPatternIndex(0);
              setScore(0);
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
  useEffect(() => {
    return () => {
      Speech.stop();
      bounceAnim.setValue(1);
      shakeAnim.setValue(0);
      fadeAnim.setValue(1);
    };
  }, []);
  
  // Initialize confetti animations when showConfetti changes
  useEffect(() => {
    if (showConfetti) {
      // Create 30 confetti animations
      const newConfettiAnimations = Array(30).fill(0).map(() => {
        const animValue = new Animated.Value(0);
        const size = Math.random() * 10 + 5;
        const left = Math.random() * width;
        const animDuration = Math.random() * 2000 + 1000;
        const animDelay = Math.random() * 500;
        const color = [
          '#FF5252', '#4CAF50', '#FFD700', '#4A90E2', '#FF8A65'
        ][Math.floor(Math.random() * 5)];
        
        // Start the animation
        Animated.timing(animValue, {
          toValue: height,
          duration: animDuration,
          useNativeDriver: true,
          delay: animDelay
        }).start();
        
        return { animValue, size, left, color };
      });
      
      setConfettiAnimations(newConfettiAnimations);
    } else {
      // Clear animations when confetti is hidden
      setConfettiAnimations([]);
    }
  }, [showConfetti]);
  
  const handleOptionPress = (option) => {
    // Ignore if feedback is showing or game is not active in timed mode
    if (showFeedback || (timedMode && !gameActive)) return;
    
    setSelectedOption(option);
    setAttempts(attempts + 1);
    
    if (option === currentPattern.answer) {
      // Correct answer
      setIsCorrect(true);
      
      // Update streak count
      const newStreakCount = streakCount + 1;
      setStreakCount(newStreakCount);
      
      // Calculate score with streak bonus
      const streakBonus = Math.min(Math.floor(newStreakCount / 3), 5) * 5; // +5 points for every 3 correct answers, max +25
      const timedBonus = timedMode ? 5 : 0; // Extra points for timed mode
      const difficultyBonus = level * 5; // Higher levels give more points
      const pointsEarned = 10 + streakBonus + timedBonus + difficultyBonus;
      
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
      
      // Speak feedback
      Speech.speak("Correct! Great job!", {
        language: 'en',
        pitch: 1.2,
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
      
      // Speak feedback
      Speech.speak("Not quite right. Try again!", {
        language: 'en',
        pitch: 0.8,
        rate: 0.8,
      });
    }
    
    // Show feedback
    setShowFeedback(true);
    
    // Show explanation after a short delay
    setTimeout(() => {
      setShowExplanation(true);
    }, 1000);
    
    // Move to next pattern after delay
    setTimeout(() => {
      if (currentPatternIndex < patternLevels[level].patterns.length - 1) {
        setCurrentPatternIndex(currentPatternIndex + 1);
      } else if (level < patternLevels.length - 1) {
        // Level complete
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        
        Alert.alert(
          "Level Complete!",
          `You completed level ${level + 1} with a score of ${score}!`,
          [
            { 
              text: "Next Level", 
              onPress: () => {
                setLevel(level + 1);
              }
            }
          ]
        );
      } else {
        // Game complete
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        
        Alert.alert(
          "Congratulations!",
          `You've completed all levels with a total score of ${score}!`,
          [
            { 
              text: "Play Again", 
              onPress: () => {
                setLevel(0);
                setScore(0);
                setStreakCount(0);
              }
            },
            {
              text: "Return to Games",
              onPress: () => navigation.navigate('Games'),
              style: "cancel"
            }
          ]
        );
      }
      
      // Reset for next question
      setShowFeedback(false);
      setIsCorrect(false);
      setSelectedOption(null);
      setShowExplanation(false);
    }, 3500);
  };
  
  const renderSequence = (sequence) => {
    return (
      <View style={styles.sequenceContainer}>
        {sequence.map((item, index) => (
          <Animated.View 
            key={index} 
            style={[
              styles.sequenceItem,
              sequence[index] === "?" ? styles.sequenceItemQuestion : null,
              { transform: [{ scale: sequence[index] === "?" ? bounceAnim : 1 }] }
            ]}
          >
            <ReadableText style={[styles.sequenceText, textStyle.text]} readable={true}>
              {item}
            </ReadableText>
          </Animated.View>
        ))}
      </View>
    );
  };
  
  const renderPattern = (pattern) => {
    return (
      <View style={styles.patternContainer}>
        <ReadableText style={[styles.patternText, textStyle.text]} readable={true}>
          {pattern}
        </ReadableText>
      </View>
    );
  };
  
  const renderOptions = (options) => {
    return (
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedOption === option && styles.selectedOption,
              showFeedback && selectedOption === option && isCorrect && styles.correctOption,
              showFeedback && selectedOption === option && !isCorrect && styles.incorrectOption,
              showFeedback && option === currentPattern.answer && !isCorrect && styles.correctOption,
            ]}
            onPress={() => handleOptionPress(option)}
            disabled={showFeedback}
          >
            <ReadableText style={[styles.optionText, textStyle.text]} readable={true}>
              {option}
            </ReadableText>
            {showFeedback && selectedOption === option && isCorrect && (
              <View style={styles.feedbackIcon}>
                <FontAwesome5 name="check-circle" size={24} color="#4CAF50" />
              </View>
            )}
            {showFeedback && selectedOption === option && !isCorrect && (
              <View style={styles.feedbackIcon}>
                <FontAwesome5 name="times-circle" size={24} color="#FF5252" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const toggleTimedMode = () => {
    setTimedMode(!timedMode);
    setScore(0);
    setLevel(0);
    setCurrentPatternIndex(0);
  };
  
  // Calculate progress
  const progress = ((currentPatternIndex + 1) / patternLevels[level].patterns.length) * 100;
  
  // Stars display based on score
  const renderStars = () => {
    const totalStars = 3;
    const earnedStars = Math.min(Math.floor(score / 50), totalStars);
    
    return (
      <View style={styles.starsContainer}>
        {[...Array(totalStars)].map((_, index) => (
          <FontAwesome5 
            key={index}
            name="star" 
            size={20} 
            color={index < earnedStars ? "#FFD700" : "#d3d3d3"}
            style={styles.starIcon}
          />
        ))}
      </View>
    );
  };
  
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Start rotation animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  
  return (
    <TextReaderRoot>
      <LinearGradient
        colors={['#6a11cb', '#2575fc']}
        style={styles.gradientBackground}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#6a11cb" />
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Animated.View style={{ transform: [{ rotate: spin }], marginRight: 10 }}>
                <MaterialCommunityIcons name="puzzle-outline" size={28} color="#FFD700" />
              </Animated.View>
              <ReadableText style={[styles.headerTitle, textStyle.text]} readable={true} priority={1}>
                Pattern Match
              </ReadableText>
            </View>
            <TouchableOpacity 
              style={[styles.timedModeButton, timedMode && styles.timedModeActive]}
              onPress={toggleTimedMode}
            >
              <Feather name="clock" size={20} color={timedMode ? "#fff" : "#FFD700"} />
            </TouchableOpacity>
          </View>
          
          {/* Game Info */}
          <View style={styles.gameInfoContainer}>
            <View style={styles.levelContainer}>
              <Ionicons name="layers" size={16} color="#4A90E2" style={styles.infoIcon} />
              <ReadableText style={[styles.levelText, textStyle.text]} readable={true}>
                Level: {level + 1}
              </ReadableText>
            </View>
            <View style={styles.scoreContainer}>
              <Ionicons name="trophy" size={16} color="#FF8A65" style={styles.infoIcon} />
              <ReadableText style={[styles.scoreText, textStyle.text]} readable={true}>
                Score: {score}
              </ReadableText>
            </View>
            {timedMode && (
              <View style={styles.timerContainer}>
                <Ionicons name="time" size={16} color={timeRemaining < 10 ? "#FF5252" : "#4CAF50"} style={styles.infoIcon} />
                <ReadableText style={[styles.timerText, timeRemaining < 10 && styles.timerWarning, textStyle.text]} readable={true}>
                  {timeRemaining}s
                </ReadableText>
              </View>
            )}
          </View>

          {/* Stars Display */}
          {renderStars()}
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
            <View style={styles.progressMarkers}>
              {patternLevels[level].patterns.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.progressMarker,
                    index < currentPatternIndex ? styles.progressMarkerCompleted : null,
                    index === currentPatternIndex ? styles.progressMarkerCurrent : null
                  ]} 
                />
              ))}
            </View>
          </View>

          {/* Streak Counter */}
          {streakCount > 0 && (
            <View style={styles.streakContainer}>
              <FontAwesome5 name="fire" size={16} color="#FF8A65" />
              <ReadableText style={[styles.streakText, textStyle.text]} readable={true}>
                {streakCount} in a row!
              </ReadableText>
            </View>
          )}
          
          <ScrollView contentContainerStyle={styles.gameContent}>
            {currentPattern && (
              <Animated.View 
                style={[
                  styles.patternCard,
                  {
                    transform: [
                      { scale: bounceAnim },
                      { translateX: shakeAnim }
                    ],
                    opacity: fadeAnim
                  }
                ]}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.9)', 'rgba(240,247,255,0.9)']}
                  style={styles.cardGradient}
                >
                  <View style={styles.questionContainer}>
                    <ReadableText style={[styles.questionText, textStyle.text]} readable={true} priority={2}>
                      {currentPattern.question}
                    </ReadableText>
                  </View>
                  
                  {currentPattern.type === "sequence" && renderSequence(currentPattern.sequence)}
                  {(currentPattern.type === "visual" || currentPattern.type === "word") && renderPattern(currentPattern.pattern)}
                  
                  {renderOptions(currentPattern.options)}
                  
                  {showExplanation && (
                    <View style={styles.explanationContainer}>
                      <ReadableText style={[styles.explanationText, textStyle.text]} readable={true} priority={3}>
                        {currentPattern.explanation}
                      </ReadableText>
                    </View>
                  )}
                </LinearGradient>
              </Animated.View>
            )}
          </ScrollView>
          
          {/* Confetti animation for level completion */}
          {showConfetti && (
            <View style={styles.confettiContainer}>
              {confettiAnimations.map((confetti, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.confetti,
                    {
                      width: confetti.size,
                      height: confetti.size,
                      left: confetti.left,
                      backgroundColor: confetti.color,
                      transform: [{ translateY: confetti.animValue }]
                    }
                  ]}
                />
              ))}
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </TextReaderRoot>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  timedModeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  timedModeActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
  },
  gameInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 10,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical:.8,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoIcon: {
    marginRight: 6,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: .8,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8A65',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: .8,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  timerWarning: {
    color: '#FF5252',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starIcon: {
    marginHorizontal: 5,
  },
  progressBarContainer: {
    width: '90%',
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 15,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  progressBar: {
    height: 16,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  progressMarkers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  progressMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  progressMarkerCompleted: {
    backgroundColor: '#4CAF50',
  },
  progressMarkerCurrent: {
    backgroundColor: '#FF8A65',
    transform: [{ scale: 1.3 }],
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'center',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8A65',
    marginLeft: 5,
  },
  gameContent: {
    padding: 20,
    alignItems: 'center',
  },
  patternCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 20,
  },
  cardGradient: {
    padding: 25,
    borderRadius: 20,
  },
  questionContainer: {
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 10,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  sequenceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  sequenceItem: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderWidth: 2,
    borderColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sequenceItemQuestion: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: '#FFD700',
  },
  sequenceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  patternContainer: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderWidth: 2,
    borderColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  patternText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  optionButton: {
    width: width * 0.4,
    padding: 15,
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedOption: {
    borderColor: '#4A90E2',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  incorrectOption: {
    borderColor: '#FF5252',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  feedbackIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  explanationContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 249, 196, 0.8)',
    borderWidth: 1,
    borderColor: '#FBC02D',
  },
  explanationText: {
    fontSize: 16,
    color: '#5D4037',
    textAlign: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    top: -20,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default PatternMatchGame;