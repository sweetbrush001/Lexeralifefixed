import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

// Import hooks separately after React
import { useState, useEffect, useRef } from 'react';

const { width, height } = Dimensions.get('window');

// Word data for spelling challenges organized by categories
const wordData = [
  // Level 1: Simple words - Animals
  [
    { word: 'cat', hint: 'A furry pet that meows', difficulty: 'easy', category: 'Animals' },
    { word: 'dog', hint: 'A loyal pet that barks', difficulty: 'easy', category: 'Animals' },
  ]
]; // Added closing brackets and semicolon

const SpellingChallengeGame = () => {
  // Move all hooks to the top level of the component
  const navigation = useNavigation();
  const textStyle = useTextStyle();
  const [level, setLevel] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0); // 0: No hint, 1: Category, 2: First letter, 3: Full hint
  const [hintUsed, setHintUsed] = useState(false);
  const [progressData, setProgressData] = useState({
    wordsAttempted: 0,
    wordsCorrect: 0,
    categoryStats: {}
  });
  
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef(null);
  
  // Current word
  const currentWord = wordData[level]?.[currentWordIndex];
  
  // Reset game when level changes
  useEffect(() => {
    setCurrentWordIndex(0);
    setShowFeedback(false);
    setIsCorrect(false);
    setUserInput('');
    setShowHint(false);
    setHintUsed(false);
  }, [level]);
  
  const handleSubmit = () => {
    // Ignore if feedback is showing
    if (showFeedback) return;
    
    setAttempts(attempts + 1);
    
    // Update progress data
    setProgressData(prev => {
      const newData = { ...prev };
      newData.wordsAttempted++;
      
      // Initialize category if it doesn't exist
      if (!newData.categoryStats[currentWord.category]) {
        newData.categoryStats[currentWord.category] = {
          attempted: 0,
          correct: 0
        };
      }
      
      // Update category stats
      newData.categoryStats[currentWord.category].attempted++;
      
      return newData;
    });
    
    if (userInput.toLowerCase().trim() === currentWord.word.toLowerCase()) {
      // Correct answer
      setIsCorrect(true);
      
      // Calculate score based on hint level
      const pointsEarned = getPointsForCurrentHintLevel();
      setScore(score + pointsEarned);
      
      // Update progress data for correct answer
      setProgressData(prev => {
        const newData = { ...prev };
        newData.wordsCorrect++;
        newData.categoryStats[currentWord.category].correct++;
        return newData;
      });
      
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
      
      // Speak the word
      Speech.speak(currentWord.word, {
        language: 'en',
        pitch: 1,
        rate: 0.8,
      });
    } else {
      // Wrong answer
      setIsCorrect(false);
      
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
    
    // Move to next word after delay
    setTimeout(() => {
      if (currentWordIndex < wordData[level].length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
      } else if (level < wordData.length - 1) {
        // Level complete
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
                setCurrentWordIndex(0);
              },
              style: "cancel"
            }
          ]
        );
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
      
      // Reset for next word
      setShowFeedback(false);
      setIsCorrect(false);
      setUserInput('');
      setShowHint(false);
      setHintUsed(false);
      
      // Focus on input for next word
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 1500);
  };
  
  const speakWord = () => {
    if (currentWord) {
      Speech.speak(currentWord.word, {
        language: 'en',
        pitch: 1,
        rate: 0.8,
      });
    }
  };
  
  const getNextHint = () => {
    // If hints are already at max level, just toggle visibility
    if (hintLevel === 3) {
      setShowHint(!showHint);
      return;
    }
    
    // Increase hint level
    const newHintLevel = hintLevel + 1;
    setHintLevel(newHintLevel);
    setShowHint(true);
    
    // Mark hint as used for scoring
    if (!hintUsed) {
      setHintUsed(true);
    }
  };
  
  const getCurrentHint = () => {
    if (!currentWord) return '';
    
    switch (hintLevel) {
      case 1:
        return `Category: ${currentWord.category}`;
      case 2:
        return `Starts with: ${currentWord.word[0].toUpperCase()} | ${currentWord.hint}`;
      case 3:
        return `Hint: ${currentWord.hint} | Word has ${currentWord.word.length} letters: ${currentWord.word.split('').map(char => '_').join(' ')}`;
      default:
        return 'Click for a hint';
    }
  };
  
  const getHintButtonText = () => {
    if (!showHint) return 'Show Hint';
    if (hintLevel < 3) return 'Next Hint';
    return 'Hide Hint';
  };
  
  const getPointsForCurrentHintLevel = () => {
    switch (hintLevel) {
      case 0: return 10; // No hint used
      case 1: return 8;  // Category hint
      case 2: return 5;  // First letter hint
      case 3: return 3;  // Full hint
      default: return 10;
    }
  };
  
  return (
    <TextReaderRoot>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
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
              Spelling Challenge
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
          </View>
          
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Game Instructions */}
            <LinearGradient
              colors={['#FF9F9F', '#FF6B6B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.instructionsCard}
            >
              <ReadableText style={styles.instructionsText} readable={true} priority={6}>
                Listen to the word and spell it correctly in the box below.
              </ReadableText>
            </LinearGradient>
            
            {/* Word Challenge */}
            {currentWord && (
              <View style={styles.challengeContainer}>
                <TouchableOpacity 
                  style={styles.speakButton}
                  onPress={speakWord}
                >
                  <Feather name="volume-2" size={24} color="#FF6B6B" />
                  <ReadableText style={styles.speakButtonText} readable={true} priority={7}>
                    Hear Word
                  </ReadableText>
                </TouchableOpacity>
                
                {/* Category Badge */}
                <View style={styles.categoryBadge}>
                  <ReadableText style={styles.categoryText} readable={true} priority={8}>
                    {currentWord.category}
                  </ReadableText>
                </View>
                
                {/* Hint Button */}
                <TouchableOpacity 
                  style={styles.hintButton}
                  onPress={getNextHint}
                >
                  <Feather name="help-circle" size={20} color="#FF6B6B" />
                  <ReadableText style={styles.hintButtonText} readable={true} priority={9}>
                    {getHintButtonText()}
                  </ReadableText>
                  {hintLevel > 0 && (
                    <View style={styles.hintLevelIndicator}>
                      <ReadableText style={styles.hintLevelText} readable={true} priority={10}>
                        {hintLevel}/3
                      </ReadableText>
                    </View>
                  )}
                </TouchableOpacity>
                
                {/* Hint Text */}
                {showHint && (
                  <View style={[styles.hintContainer, styles[`hintLevel${hintLevel}`]]}>
                    <ReadableText style={styles.hintText} readable={true} priority={11}>
                      {getCurrentHint()}
                    </ReadableText>
                    {hintLevel > 0 && (
                      <ReadableText style={styles.pointsText} readable={true} priority={12}>
                        Points: {getPointsForCurrentHintLevel()}
                      </ReadableText>
                    )}
                  </View>
                )}
                
                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                  <ReadableText style={styles.progressText} readable={true} priority={13}>
                    Progress: {progressData.wordsCorrect}/{progressData.wordsAttempted} words
                  </ReadableText>
                  <View style={styles.progressBar}>
                    <View 
                      style={[styles.progressFill, { width: `${progressData.wordsAttempted > 0 ? (progressData.wordsCorrect / progressData.wordsAttempted) * 100 : 0}%` }]}
                    />
                  </View>
                </View>
                
                {/* Input Field */}
                <Animated.View 
                  style={[styles.inputContainer, { transform: [{ translateX: shakeAnim }] }]}
                >
                  <TextInput
                    ref={inputRef}
                    style={[styles.input, textStyle]}
                    value={userInput}
                    onChangeText={setUserInput}
                    placeholder="Type your answer here"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleSubmit}
                  />
                </Animated.View>
                
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <ReadableText style={styles.submitButtonText} readable={true} priority={10}>
                    Submit
                  </ReadableText>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Feedback */}
            {showFeedback && (
              <View style={styles.feedbackContainer}>
                <ReadableText 
                  style={[styles.feedbackText, isCorrect ? styles.correctFeedback : styles.wrongFeedback]} 
                  readable={true} 
                  priority={11}
                >
                  {isCorrect ? 'Correct!' : 'Try Again!'}
                </ReadableText>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TextReaderRoot>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
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
    minWidth: width * 0.25,
  },
  scoreLabel: {
    fontSize: 14,
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
    minWidth: width * 0.25,
  },
  levelLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  levelValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  instructionsCard: {
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
  },
  instructionsText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  challengeContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 15,
  },
  speakButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF6B6B',
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  hintButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#FF6B6B',
  },
  categoryBadge: {
    backgroundColor: '#FF9F9F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'center',
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  hintContainer: {
    backgroundColor: '#FFF0F0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
  },
  hintLevel1: {
    backgroundColor: '#F8F8F8',
    borderColor: '#EAEAEA',
    borderWidth: 1,
  },
  hintLevel2: {
    backgroundColor: '#FFF9F0',
    borderColor: '#FFE0B2',
    borderWidth: 1,
  },
  hintLevel3: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FFCDD2',
    borderWidth: 1,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  pointsText: {
    fontSize: 12,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold',
  },
  hintLevelIndicator: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
  },
  hintLevelText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 15,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    width: '100%',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  feedbackContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  correctFeedback: {
    color: '#4CAF50',
  },
  wrongFeedback: {
    color: '#F44336',
  },
});

export default SpellingChallengeGame;
