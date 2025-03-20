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
  Modal,
  FlatList,
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

// Import useSettings hook for accessing font settings
import { useSettings } from '../../context/SettingsContext';

// Import useTimer hook for timing functionality
import useTimer from '../../hooks/useTimer';

// Import useAudioPlayer hook for sound effects
import useAudioPlayer from '../../hooks/useAudioPlayer';

// Import game data
import { wordFlowLevels, achievements, gameTips } from '../../data/wordFlowData';

const { width, height } = Dimensions.get('window');

const WordFlowGame = () => {
  const navigation = useNavigation();
  const textStyle = useTextStyle();
  const { settings } = useSettings();
  
  // Create font style object based on settings
  const fontStyle = {
    fontFamily: settings.isDyslexicFriendly ? 'OpenDyslexic-Regular' : undefined,
  };
  
  // Game state
  const [level, setLevel] = useState(0);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
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
  const [showAchievements, setShowAchievements] = useState(false);
  const [earnedAchievements, setEarnedAchievements] = useState([]);
  const [showTips, setShowTips] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const [fastResponses, setFastResponses] = useState(0);
  
  // Animation refs
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const challengeStartTimeRef = useRef(null);
  
  // Audio player for sound effects
  const { playTrack } = useAudioPlayer();
  
  // Current challenge
  const currentChallenge = wordFlowLevels[level]?.challenges[currentChallengeIndex];
  
  // Reset game when level changes
  useEffect(() => {
    setCurrentChallengeIndex(0);
    setShowFeedback(false);
    setIsCorrect(false);
    setSelectedOption(null);
    setShowExplanation(false);
    
    // Reset timer when level changes
    if (timedMode) {
      setTimeRemaining(60);
      setGameActive(true);
    }
    
    // Set challenge start time
    challengeStartTimeRef.current = Date.now();
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
              setCurrentChallengeIndex(0);
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
  
  // Set challenge start time when challenge changes
  useEffect(() => {
    challengeStartTimeRef.current = Date.now();
  }, [currentChallengeIndex]);
  
  // Check for achievements
  useEffect(() => {
    // Check for Speed Demon achievement
    if (fastResponses >= 5 && !earnedAchievements.includes('speed_demon')) {
      const newAchievements = [...earnedAchievements, 'speed_demon'];
      setEarnedAchievements(newAchievements);
      setScore(score + 100); // Add achievement reward
      
      // Show achievement notification
      Alert.alert(
        "Achievement Unlocked!",
        "Speed Demon: Complete 5 challenges in under 3 seconds each",
        [{ text: "Awesome!" }]
      );
    }
    
    // Check for Perfect Level achievement
    if (currentChallengeIndex === wordFlowLevels[level].challenges.length - 1 && 
        attempts === wordFlowLevels[level].challenges.length && 
        streakCount === wordFlowLevels[level].challenges.length &&
        !earnedAchievements.includes('perfect_level')) {
      const newAchievements = [...earnedAchievements, 'perfect_level'];
      setEarnedAchievements(newAchievements);
      setScore(score + 200); // Add achievement reward
      
      // Show achievement notification
      Alert.alert(
        "Achievement Unlocked!",
        "Perfect Level: Complete an entire level with 100% accuracy",
        [{ text: "Excellent!" }]
      );
    }
  }, [fastResponses, currentChallengeIndex, attempts, streakCount]);
  
  const handleOptionPress = (option) => {
    // Ignore if feedback is showing or game is not active in timed mode
    if (showFeedback || (timedMode && !gameActive)) return;
    
    // Calculate response time
    const responseTimeMs = Date.now() - challengeStartTimeRef.current;
    setResponseTime(responseTimeMs / 1000); // Convert to seconds
    
    // Check if response was fast (under 3 seconds)
    if (responseTimeMs < 3000) {
      setFastResponses(prev => prev + 1);
    }
    
    setSelectedOption(option);
    setAttempts(attempts + 1);
    
    if (option === currentChallenge.answer) {
      // Correct answer
      setIsCorrect(true);
      
      // Play success sound
      playTrack('https://lexeralifefixed.s3.amazonaws.com/assets/sounds/tada-military-2-183973.mp3', 'success');
      
      // Update streak count
      const newStreakCount = streakCount + 1;
      setStreakCount(newStreakCount);
      
      // Calculate score with streak bonus
      const streakBonus = Math.min(Math.floor(newStreakCount / 3), 5) * 5; // +5 points for every 3 correct answers, max +25
      const timedBonus = timedMode ? 5 : 0; // Extra points for timed mode
      const difficultyBonus = level * 5; // Higher levels give more points
      const speedBonus = Math.max(0, currentChallenge.timeLimit - (responseTimeMs / 1000)) * 2; // Bonus for fast responses
      const pointsEarned = currentChallenge.points + streakBonus + timedBonus + difficultyBonus + Math.floor(speedBonus);
      
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
      
      // Play error sound
      playTrack('https://lexeralifefixed.s3.amazonaws.com/assets/sounds/error-10-206498.mp3', 'error');
      
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
    
    // Move to next challenge after delay
    setTimeout(() => {
      if (currentChallengeIndex < wordFlowLevels[level].challenges.length - 1) {
        setCurrentChallengeIndex(currentChallengeIndex + 1);
      } else if (level < wordFlowLevels.length - 1) {
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
          "Game Complete!",
          `Congratulations! You've completed all levels with a total score of ${score}!`,
          [
            { 
              text: "Play Again", 
              onPress: () => {
                setLevel(0);
                setScore(0);
                setStreakCount(0);
                setGameActive(true);
              }
            },
            {
              text: "Back to Games",
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
  
  const toggleTimedMode = () => {
    setTimedMode(!timedMode);
    setScore(0);
    setLevel(0);
    setCurrentChallengeIndex(0);
    setGameActive(true);
  };
  
  // Calculate progress
  const progress = ((currentChallengeIndex + 1) / wordFlowLevels[level].challenges.length) * 100;
  
  // Render achievements modal
  const renderAchievementsModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAchievements}
        onRequestClose={() => setShowAchievements(false)}
      >
        <BlurView intensity={90} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ReadableText style={[styles.modalTitle, fontStyle]} readable={true}>
              Achievements
            </ReadableText>
            
            <FlatList
              data={achievements}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isEarned = earnedAchievements.includes(item.id);
                return (
                  <View style={[styles.achievementItem, isEarned ? styles.achievementEarned : styles.achievementLocked]}>
                    <FontAwesome5 
                      name={item.icon} 
                      size={24} 
                      color={isEarned ? '#FFD700' : '#999'} 
                    />
                    <View style={styles.achievementInfo}>
                      <ReadableText style={[styles.achievementTitle, fontStyle, isEarned ? styles.textEarned : styles.textLocked]} readable={true}>
                        {item.title}
                      </ReadableText>
                      <ReadableText style={[styles.achievementDesc, fontStyle, isEarned ? styles.textEarned : styles.textLocked]} readable={true}>
                        {item.description}
                      </ReadableText>
                    </View>
                    <View style={styles.achievementReward}>
                      <ReadableText style={[styles.rewardText, fontStyle, isEarned ? styles.textEarned : styles.textLocked]} readable={true}>
                        +{item.reward}
                      </ReadableText>
                    </View>
                  </View>
                );
              }}
            />
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAchievements(false)}
            >
              <ReadableText style={[styles.closeButtonText, fontStyle]} readable={true}>
                Close
              </ReadableText>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    );
  };
  
  // Render tips modal
  const renderTipsModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTips}
        onRequestClose={() => setShowTips(false)}
      >
        <BlurView intensity={90} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ReadableText style={[styles.modalTitle, fontStyle]} readable={true}>
              Game Tips
            </ReadableText>
            
            <FlatList
              data={gameTips}
              keyExtractor={(item, index) => `tip-${index}`}
              renderItem={({ item, index }) => (
                <View style={styles.tipItem}>
                  <ReadableText style={[styles.tipNumber, fontStyle]} readable={true}>
                    {index + 1}.
                  </ReadableText>
                  <ReadableText style={[styles.tipText, fontStyle]} readable={true}>
                    {item}
                  </ReadableText>
                </View>
              )}
            />
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowTips(false)}
            >
              <ReadableText style={[styles.closeButtonText, fontStyle]} readable={true}>
                Close
              </ReadableText>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    );
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
          <ReadableText style={[styles.headerTitle, fontStyle]} readable={true}>
            Word Flow
          </ReadableText>
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => setShowTips(true)}
          >
            <Feather name="info" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        
        {/* Game Info */}
        <View style={styles.gameInfo}>
          <View style={styles.levelInfo}>
            <ReadableText style={[styles.levelText, fontStyle]} readable={true}>
              Level {level + 1}: {wordFlowLevels[level].difficulty}
            </ReadableText>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
          
          <View style={styles.scoreContainer}>
            <ReadableText style={[styles.scoreLabel, fontStyle]} readable={true}>
              Score
            </ReadableText>
            <ReadableText style={[styles.scoreValue, fontStyle]} readable={true}>
              {score}
            </ReadableText>
          </View>
          
          {timedMode && (
            <View style={styles.timerContainer}>
              <ReadableText style={[styles.timerLabel, fontStyle]} readable={true}>
                Time
              </ReadableText>
              <ReadableText 
                style={[
                  styles.timerValue, 
                  fontStyle,
                  timeRemaining < 10 ? styles.timerWarning : null
                ]} 
                readable={true}
              >
                {timeRemaining}s
              </ReadableText>
            </View>
          )}
        </View>
        
        {/* Game Instructions */}
        <ScrollView 
          style={styles.gameContent}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {currentChallenge && (
            <>
              <Animated.View 
                style={[
                  styles.questionContainer,
                  { transform: [{ translateX: shakeAnim }] }
                ]}
              >
                <ReadableText style={[styles.questionType, fontStyle]} readable={true}>
                  {currentChallenge.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </ReadableText>
                <ReadableText style={[styles.questionText, fontStyle]} readable={true}>
                  {currentChallenge.question}
                </ReadableText>
              </Animated.View>
              
              <View style={styles.optionsContainer}>
                {currentChallenge.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedOption === option && styles.selectedOption,
                      showFeedback && selectedOption === option && isCorrect && styles.correctOption,
                      showFeedback && selectedOption === option && !isCorrect && styles.incorrectOption,
                      showFeedback && option === currentChallenge.answer && !isCorrect && styles.correctOption,
                    ]}
                    onPress={() => handleOptionPress(option)}
                    disabled={showFeedback}
                  >
                    <Animated.View style={{ transform: [{ scale: selectedOption === option ? bounceAnim : 1 }] }}>
                      <ReadableText style={[styles.optionText, fontStyle]} readable={true}>
                        {option}
                      </ReadableText>
                    </Animated.View>
                    
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
              
              {showExplanation && (
                <Animated.View 
                  style={[styles.explanationContainer, { opacity: fadeAnim }]}
                >
                  <ReadableText style={[styles.explanationTitle, fontStyle]} readable={true}>
                    Explanation:
                  </ReadableText>
                  <ReadableText style={[styles.explanationText, fontStyle]} readable={true}>
                    {currentChallenge.explanation}
                  </ReadableText>
                </Animated.View>
              )}
            </>
          )}
        </ScrollView>
        
        {/* Game Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setShowAchievements(true)}
          >
            <FontAwesome5 name="trophy" size={20} color="#FF6B6B" />
            <ReadableText style={[styles.controlText, fontStyle]} readable={true}>
              Achievements
            </ReadableText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.timedModeButton, timedMode ? styles.timedModeActive : null]}
            onPress={toggleTimedMode}
          >
            <Ionicons name="timer-outline" size={20} color={timedMode ? "#fff" : "#FF6B6B"} />
            <ReadableText 
              style={[
                styles.controlText, 
                fontStyle,
                timedMode ? styles.timedModeTextActive : null
              ]} 
              readable={true}
            >
              Timed Mode
            </ReadableText>
          </TouchableOpacity>
        </View>
        
        {/* Confetti animation for level completion */}
        {showConfetti && (
          <View style={styles.confettiContainer}>
            {confettiAnimations.map((confetti, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.confetti,
                  {
                    left: confetti.left,
                    width: confetti.size,
                    height: confetti.size * 3,
                    backgroundColor: confetti.color,
                    transform: [{ translateY: confetti.animValue }]
                  }
                ]}
              />
            ))}
          </View>
        )}
        
        {/* Modals */}
        {renderAchievementsModal()}
        {renderTipsModal()}
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
  infoButton: {
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
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  levelInfo: {
    flex: 1,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 3,
  },
  scoreContainer: {
    alignItems: 'center',
    marginLeft: 15,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timerContainer: {
    alignItems: 'center',
    marginLeft: 15,
  },
  timerLabel: {
    fontSize: 12,
    color: '#666',
  },
  timerValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timerWarning: {
    color: '#FF5252',
  },
  gameContent: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  questionContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  questionType: {
    fontSize: 14,
    color: '#FF6B6B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedOption: {
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  correctOption: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  incorrectOption: {
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#FF5252',
  },
  optionText: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  feedbackIcon: {
    marginLeft: 10,
  },
  explanationContainer: {
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  explanationText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  controlText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  timedModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  timedModeActive: {
    backgroundColor: '#FF6B6B',
  },
  timedModeTextActive: {
    color: '#fff',
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
    borderRadius: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  achievementEarned: {
    backgroundColor: '#FFF8E1',
  },
  achievementLocked: {
    backgroundColor: '#f5f5f5',
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 15,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  achievementDesc: {
    fontSize: 14,
  },
  textEarned: {
    color: '#333',
  },
  textLocked: {
    color: '#999',
  },
  achievementReward: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tipNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 8,
    width: 25,
  },
  tipText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WordFlowGame;