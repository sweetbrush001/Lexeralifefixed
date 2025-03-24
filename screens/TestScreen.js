import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get('window');

// Updated color scheme to match the other screens
const COLORS = {
  primary: "#7C4DFF", // Purple primary color
  primaryLight: "#EDE7F6",
  secondary: "#FF9800", // Orange accent
  background: "#FFFFFF",
  card: "#F9F9F9",
  text: "#333333",
  textLight: "#757575",
  success: "#66BB6A",
  error: "#EF5350",
  skip: "#FFA726",
  yellow: "#FFD54F",
  border: "#EEEEEE",
};

export default function TestScreen({ flashcards, setActiveTab, timer }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0, skipped: 0 });
  const [flipAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [timeLeft, setTimeLeft] = useState(timer);
  const [intervalId, setIntervalId] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [resultAnimation] = useState(new Animated.Value(0));
  const confettiRef = useRef(null);

  useEffect(() => {
    resetTest();
    return () => clearInterval(intervalId);
  }, [flashcards, timer]);

  const handleResponse = (response) => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const updatedScore = { ...score, [response]: score[response] + 1 };
    setScore(updatedScore);

    if (currentIndex < flashcards.length - 1) {
      // Reset card flip
      setShowAnswer(false);
      flipAnim.setValue(0);
      
      // Move to next card with a slight delay for animation
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 200);
    } else {
      clearInterval(intervalId);
      displayResults(updatedScore);
    }
  };

  const displayResults = (updatedScore) => {
    const total = flashcards.length;
    setShowResults(true);
    
    // Animate results screen appearance
    Animated.timing(resultAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const resetTest = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setScore({ correct: 0, wrong: 0, skipped: 0 });
    flipAnim.setValue(0);
    setTimeLeft(timer);
    setShowResults(false);
    resultAnimation.setValue(0);
    
    if (timer > 0) {
      // Clear any existing interval
      if (intervalId) {
        clearInterval(intervalId);
      }
      
      const id = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(id);
            displayResults(score);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      setIntervalId(id);
    }
  };

  const flipCard = () => {
    setShowAnswer(!showAnswer);
    Animated.spring(flipAnim, {
      toValue: showAnswer ? 0 : 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getTimerBarColor = () => {
    if (timeLeft <= timer * 0.2) {
      return COLORS.error;
    } else if (timeLeft <= timer * 0.5) {
      return COLORS.yellow;
    } else {
      return COLORS.success;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get category color for the card
  const getCategoryColor = (category) => {
    const categories = {
      "technology": "#7C4DFF",
      "geography": "#26A69A",
      "history": "#EF5350",
      "science": "#42A5F5",
      "other": "#FFA726"
    };
    
    return categories[category] || COLORS.primary;
  };

  if (!flashcards.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.container}>
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={64} color={COLORS.primaryLight} />
            <Text style={styles.emptyTitle}>No flashcards available</Text>
            <Text style={styles.emptyText}>
              Please select a collection to test your knowledge
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setActiveTab('saved')}
            >
              <Text style={styles.emptyButtonText}>Back to Collections</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = `${currentIndex + 1}/${flashcards.length}`;
  const categoryColor = getCategoryColor(currentCard.category);

  if (showResults) {
    const total = flashcards.length;
    const percentage = Math.round((score.correct / total) * 100);
    const resultMessage = percentage >= 80 ? "Excellent!" : 
                          percentage >= 60 ? "Good job!" : 
                          percentage >= 40 ? "Keep practicing!" : "Don't give up!";
    
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <Animated.View 
          style={[
            styles.container, 
            { 
              opacity: resultAnimation,
              transform: [{ 
                translateY: resultAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }]
            }
          ]}
        >
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Test Complete!</Text>
              <Text style={styles.resultsMessage}>{resultMessage}</Text>
            </View>
            
            <View style={styles.scoreCircle}>
              <Text style={styles.scorePercentage}>{percentage}%</Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={[styles.statItem, { backgroundColor: COLORS.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                <Text style={styles.statValue}>{score.correct}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              
              <View style={[styles.statItem, { backgroundColor: COLORS.error + '20' }]}>
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
                <Text style={styles.statValue}>{score.wrong}</Text>
                <Text style={styles.statLabel}>Wrong</Text>
              </View>
              
              <View style={[styles.statItem, { backgroundColor: COLORS.skip + '20' }]}>
                <Ionicons name="play-skip-forward-circle" size={24} color={COLORS.skip} />
                <Text style={styles.statValue}>{score.skipped}</Text>
                <Text style={styles.statLabel}>Skipped</Text>
              </View>
            </View>
            
            {timeLeft > 0 && timer > 0 && (
              <View style={styles.timeRemainingContainer}>
                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                <Text style={styles.timeRemainingText}>
                  Completed with {formatTime(timeLeft)} remaining
                </Text>
              </View>
            )}
            
            <View style={styles.resultsButtonsContainer}>
              <TouchableOpacity 
                style={[styles.resultsButton, { backgroundColor: COLORS.primary }]}
                onPress={resetTest}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.resultsButtonText}>Try Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.resultsButton, { backgroundColor: COLORS.textLight }]}
                onPress={() => setActiveTab('saved')}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
                <Text style={styles.resultsButtonText}>Back to Collections</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              clearInterval(intervalId);
              setActiveTab('saved');
            }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{progress}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(currentIndex / (flashcards.length - 1)) * 100}%`,
                    backgroundColor: categoryColor
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, { color: categoryColor }]}>
              {score.correct}
            </Text>
            <Text style={styles.scoreLabel}>correct</Text>
          </View>
        </View>
        
        {timer > 0 && (
          <View style={styles.timerContainer}>
            <View style={styles.timerHeader}>
              <Ionicons name="time-outline" size={18} color={getTimerBarColor()} />
              <Text style={[styles.timerText, { color: getTimerBarColor() }]}>
                {formatTime(timeLeft)}
              </Text>
            </View>
            <View style={styles.timerBarContainer}>
              <View style={styles.timerBarOutline}>
                <View 
                  style={[
                    styles.timerBar, 
                    { 
                      backgroundColor: getTimerBarColor(), 
                      width: `${(timeLeft / timer) * 100}%` 
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        )}

        <View style={styles.cardSection}>
          <Animated.View 
            style={[
              styles.cardContainer,
              {
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.card}
              activeOpacity={0.9}
              onPress={flipCard}
            >
              <Animated.View 
                style={[
                  styles.cardFace,
                  {
                    backgroundColor: currentCard.color || COLORS.card,
                    transform: [{
                      rotateY: flipAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg']
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.cardHeader}>
                  <View 
                    style={[
                      styles.categoryBadge, 
                      { backgroundColor: categoryColor }
                    ]}
                  >
                    <Text style={styles.categoryText}>
                      {currentCard.category || "General"}
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>Question</Text>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={styles.cardText}>
                    {currentCard.question}
                  </Text>
                </View>
                
                <View style={styles.cardFooter}>
                  <View style={styles.tapHintContainer}>
                    <Ionicons name="sync-outline" size={14} color={COLORS.textLight} />
                    <Text style={styles.tapHint}>Tap to flip</Text>
                  </View>
                </View>
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.cardFace,
                  styles.cardBack,
                  {
                    backgroundColor: currentCard.color || COLORS.card,
                    transform: [{
                      rotateY: flipAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['180deg', '360deg']
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.cardHeader}>
                  <View 
                    style={[
                      styles.categoryBadge, 
                      { backgroundColor: categoryColor }
                    ]}
                  >
                    <Text style={styles.categoryText}>
                      {currentCard.category || "General"}
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>Answer</Text>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={styles.cardText}>
                    {currentCard.answer}
                  </Text>
                </View>
                
                <View style={styles.cardFooter}>
                  <View style={styles.tapHintContainer}>
                    <Ionicons name="sync-outline" size={14} color={COLORS.textLight} />
                    <Text style={styles.tapHint}>Tap to flip</Text>
                  </View>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.responseButton, styles.wrongButton]}
            onPress={() => handleResponse('wrong')}
          >
            <Ionicons name="close" size={28} color="#fff" />
            <Text style={styles.buttonText}>Wrong</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.responseButton, styles.skipButton]}
            onPress={() => handleResponse('skipped')}
          >
            <Ionicons name="play-skip-forward" size={28} color="#fff" />
            <Text style={styles.buttonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.responseButton, styles.correctButton]}
            onPress={() => handleResponse('correct')}
          >
            <Ionicons name="checkmark" size={28} color="#fff" />
            <Text style={styles.buttonText}>Correct</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  timerContainer: {
    marginBottom: 16,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  timerBarContainer: {
    height: 10,
    width: '100%',
  },
  timerBarOutline: {
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  timerBar: {
    height: '100%',
    borderRadius: 5,
  },
  cardSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
    height: 300,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 16,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 26,
  },
  cardFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  tapHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapHint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  responseButton: {
    flex: 1,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wrongButton: {
    backgroundColor: COLORS.error,
  },
  skipButton: {
    backgroundColor: COLORS.skip,
  },
  correctButton: {
    backgroundColor: COLORS.success,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  resultsMessage: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  scorePercentage: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scoreLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  timeRemainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  timeRemainingText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  resultsButtonsContainer: {
    width: '100%',
  },
  resultsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});