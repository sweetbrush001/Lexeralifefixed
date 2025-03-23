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
  Easing,
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
import { Ionicons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

// Import TextReaderRoot and ReadableText for accessibility
import TextReaderRoot from '../../components/TextReaderRoot';
import ReadableText from '../../components/ReadableText';

// Import useTextStyle hook for applying text styling from settings
import { useTextStyle } from '../../hooks/useTextStyle';

// Import hooks separately after React
import { useState, useEffect, useRef } from 'react';

const { width, height } = Dimensions.get('window');

// Enhanced word data for spelling challenges with progressive difficulty
const wordData = [
  // Level 1: Simple words - Animals (3-letter words)
  [
    { word: 'cat', hint: 'A furry pet that meows', difficulty: 'easy', category: 'Animals' },
    { word: 'dog', hint: 'A loyal pet that barks', difficulty: 'easy', category: 'Animals' },
    { word: 'pig', hint: 'A pink farm animal that oinks', difficulty: 'easy', category: 'Animals' },
    { word: 'fox', hint: 'An orange wild animal with a bushy tail', difficulty: 'easy', category: 'Animals' },
    { word: 'cow', hint: 'A farm animal that gives milk', difficulty: 'easy', category: 'Animals' },
  ],
  // Level 2: Simple words - Colors (4-letter words)
  [
    { word: 'blue', hint: 'The color of the sky', difficulty: 'easy', category: 'Colors' },
    { word: 'pink', hint: 'A light reddish color', difficulty: 'easy', category: 'Colors' },
    { word: 'gold', hint: 'The color of treasures', difficulty: 'easy', category: 'Colors' },
    { word: 'gray', hint: 'Between black and white', difficulty: 'easy', category: 'Colors' },
    { word: 'teal', hint: 'A blue-green color', difficulty: 'easy', category: 'Colors' },
  ],
  // Level 3: Food (4-5 letter words)
  [
    { word: 'cake', hint: 'A sweet dessert for birthdays', difficulty: 'medium', category: 'Food' },
    { word: 'bread', hint: 'Made from flour and baked', difficulty: 'medium', category: 'Food' },
    { word: 'apple', hint: 'A round red or green fruit', difficulty: 'medium', category: 'Food' },
    { word: 'pizza', hint: 'A round Italian dish with cheese and toppings', difficulty: 'medium', category: 'Food' },
    { word: 'pasta', hint: 'Italian food made from dough', difficulty: 'medium', category: 'Food' },
  ],
  // Level 4: Body Parts (5-6 letter words)
  [
    { word: 'finger', hint: 'You have ten of these on your hands', difficulty: 'medium', category: 'Body Parts' },
    { word: 'elbow', hint: 'The joint in the middle of your arm', difficulty: 'medium', category: 'Body Parts' },
    { word: 'stomach', hint: 'Where food goes after you eat it', difficulty: 'medium', category: 'Body Parts' },
    { word: 'tongue', hint: 'Used for tasting and speaking', difficulty: 'medium', category: 'Body Parts' },
    { word: 'throat', hint: 'The passage from your mouth to your stomach', difficulty: 'medium', category: 'Body Parts' },
  ],
  // Level 5: Vehicles (6-7 letter words)
  [
    { word: 'bicycle', hint: 'A two-wheeled vehicle you pedal', difficulty: 'hard', category: 'Vehicles' },
    { word: 'rocket', hint: 'A vehicle that flies to space', difficulty: 'hard', category: 'Vehicles' },
    { word: 'sailboat', hint: 'A boat powered by wind', difficulty: 'hard', category: 'Vehicles' },
    { word: 'tractor', hint: 'A vehicle used on farms', difficulty: 'hard', category: 'Vehicles' },
    { word: 'subway', hint: 'An underground train', difficulty: 'hard', category: 'Vehicles' },
  ],
  // Level 6: Weather (7-8 letter words)
  [
    { word: 'thunder', hint: 'The loud noise during a storm', difficulty: 'hard', category: 'Weather' },
    { word: 'blizzard', hint: 'A severe snowstorm', difficulty: 'hard', category: 'Weather' },
    { word: 'rainbow', hint: 'Colorful arc in the sky after rain', difficulty: 'hard', category: 'Weather' },
    { word: 'lightning', hint: 'A flash of electricity in the sky', difficulty: 'hard', category: 'Weather' },
    { word: 'hurricane', hint: 'A powerful storm with strong winds', difficulty: 'hard', category: 'Weather' },
  ],
  // Level 7: Science (8+ letter words)
  [
    { word: 'chemistry', hint: 'The study of substances and their reactions', difficulty: 'expert', category: 'Science' },
    { word: 'microscope', hint: 'A tool to see very tiny things', difficulty: 'expert', category: 'Science' },
    { word: 'earthquake', hint: 'When the ground shakes', difficulty: 'expert', category: 'Science' },
    { word: 'dinosaur', hint: 'Ancient reptiles that no longer exist', difficulty: 'expert', category: 'Science' },
    { word: 'telescope', hint: 'Used to look at stars and planets', difficulty: 'expert', category: 'Science' },
  ],
];

// Enhanced PressableRipple component with water-like ripple effects
const WaterRipple = ({ style, children, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0.5)).current;
  
  const handlePressIn = () => {
    // Scale down the button slightly
    Animated.timing(scale, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start();
    
    // Create ripple effect
    rippleOpacity.setValue(0.5);
    rippleScale.setValue(0.5);
    Animated.parallel([
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(rippleScale, {
        toValue: 2,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const handlePressOut = () => {
    // Bounce back effect
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.03,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    // Provide light haptic feedback for a "watery" feel
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View style={[style, { transform: [{ scale }], overflow: 'hidden' }]}>
        {children}
        <Animated.View 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            borderRadius: 100,
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Add a wavy background pattern component
const WaterBackground = () => {
  const translateY1 = useRef(new Animated.Value(0)).current;
  const translateY2 = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Create slow wave animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY1, {
          toValue: 20,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(translateY1, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
    
    // Create second wave animation slightly out of phase
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY2, {
          toValue: 15,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(translateY2, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
  }, []);
  
  return (
    <View style={styles.waterBackgroundContainer}>
      <Animated.View 
        style={[
          styles.waterWave,
          { transform: [{ translateY: translateY1 }], bottom: height * 0.1 }
        ]}
      />
      <Animated.View 
        style={[
          styles.waterWave,
          { transform: [{ translateY: translateY2 }], bottom: height * 0.05 }
        ]}
      />
    </View>
  );
};

// Enhanced water particle effect component
const WaterParticle = ({ index, isActive }) => {
  const randomStart = Math.random() * width;
  const randomDelay = Math.random() * 2000;
  const randomDuration = 1500 + Math.random() * 3000;
  const randomSize = 5 + Math.random() * 10;
  
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;
  
  useEffect(() => {
    if (isActive) {
      // Reset values
      translateY.setValue(-50);
      translateX.setValue(0);
      opacity.setValue(0);
      scale.setValue(0.3);
      
      // Start animation after random delay
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: height * 0.3 * Math.random(),
            duration: randomDuration,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
          Animated.timing(translateX, {
            toValue: (Math.random() - 0.5) * 100,
            duration: randomDuration,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.7,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: randomDuration - 500,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.6,
              duration: randomDuration - 500,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }, randomDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, index]);
  
  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left: randomStart,
        width: randomSize,
        height: randomSize,
        borderRadius: randomSize / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        opacity,
        transform: [
          { translateY },
          { translateX },
          { scale }
        ],
        zIndex: 5,
      }}
    />
  );
};

// Level indicator component
const LevelProgressBar = ({ currentLevel, totalLevels }) => {
  return (
    <View style={styles.levelProgressContainer}>
      <ReadableText style={styles.levelProgressText} readable={true}>
        Level {currentLevel + 1} of {totalLevels}
      </ReadableText>
      <View style={styles.levelProgressBarContainer}>
        {Array(totalLevels).fill().map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.levelProgressItem, 
              { 
                backgroundColor: i <= currentLevel ? '#4FC3F7' : 'rgba(255, 255, 255, 0.3)',
                width: `${95 / totalLevels}%`,
              }
            ]} 
          />
        ))}
      </View>
    </View>
  );
};

// Difficulty badge component
const DifficultyBadge = ({ difficulty }) => {
  let color, icon, label;
  
  switch(difficulty) {
    case 'easy':
      color = '#4CAF50';
      icon = 'seedling';
      label = 'Easy';
      break;
    case 'medium':
      color = '#FF9800';
      icon = 'fire-alt';
      label = 'Medium';
      break;
    case 'hard':
      color = '#F44336';
      icon = 'fire';
      label = 'Hard';
      break;
    case 'expert':
      color = '#9C27B0';
      icon = 'crown';
      label = 'Expert';
      break;
    default:
      color = '#4FC3F7';
      icon = 'star';
      label = 'Normal';
  }
  
  return (
    <View style={[styles.difficultyBadge, { backgroundColor: `${color}30`, borderColor: color }]}>
      <FontAwesome5 name={icon} size={12} color={color} />
      <Text style={[styles.difficultyText, { color }]}>{label}</Text>
    </View>
  );
};

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
  
  // Add new animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;
  
  // Add new state variables
  const [showLevelIntro, setShowLevelIntro] = useState(true);
  const [celebrateEffect, setCelebrateEffect] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [gameStats, setGameStats] = useState({
    correctWords: 0,
    totalAttempts: 0,
    hintsUsed: 0,
    perfectWords: 0,
  });
  
  const levelIntroAnim = useRef(new Animated.Value(0)).current;
  const streakAnim = useRef(new Animated.Value(1)).current;
  const containerScaleAnim = useRef(new Animated.Value(1)).current;
  
  // Start card pulsing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
      ])
    ).start();
  }, []);
  
  // Current word
  const currentWord = wordData[level]?.[currentWordIndex];
  
  // Configure difficulty based on level
  const currentDifficulty = currentWord?.difficulty || 'easy';
  
  // Reset game when level changes
  useEffect(() => {
    if (level > 0) {
      setShowLevelIntro(true);
      Animated.sequence([
        Animated.timing(levelIntroAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(levelIntroAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowLevelIntro(false);
      });
    } else {
      setShowLevelIntro(false);
    }
    
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
      
      // Update streak
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      
      // Celebrate when streak reaches 3 or more
      if (newStreak >= 3) {
        setCelebrateEffect(true);
        
        // Reset celebration after a delay
        setTimeout(() => {
          setCelebrateEffect(false);
        }, 2500);
      }
      
      // Animate streak
      Animated.sequence([
        Animated.timing(streakAnim, {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(streakAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Update game stats
      setGameStats(prev => ({
        ...prev,
        correctWords: prev.correctWords + 1,
        totalAttempts: prev.totalAttempts + 1,
        perfectWords: !hintUsed ? prev.perfectWords + 1 : prev.perfectWords,
      }));
      
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Animate success with bubble effect
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
      
      // Animate bubbles
      Animated.timing(bubbleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        bubbleAnim.setValue(0);
      });
      
      // Speak the word
      Speech.speak(currentWord.word, {
        language: 'en',
        pitch: 1,
        rate: 0.8,
      });
    } else {
      // Wrong answer
      setIsCorrect(false);
      setStreakCount(0); // Reset streak on wrong answer
      
      // Update game stats
      setGameStats(prev => ({
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
      }));
      
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
    
    // Animate container
    Animated.sequence([
      Animated.timing(containerScaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(containerScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
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
      
      // Add a little bounce animation when speaking
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
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
      // Update hint usage stat
      setGameStats(prev => ({
        ...prev,
        hintsUsed: prev.hintsUsed + 1,
      }));
    }
    
    // Provide light haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />
          
          <WaterBackground />
          
          {/* Celebration Effect */}
          {celebrateEffect && 
            Array(20).fill().map((_, i) => 
              <WaterParticle key={i} index={i} isActive={celebrateEffect} />
            )
          }
          
          {/* Header */}
          <View style={styles.header}>
            <WaterRipple 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="#4FC3F7" />
            </WaterRipple>
            <ReadableText style={styles.headerTitle} readable={true} priority={1}>
              Ocean Spelling
            </ReadableText>
            <WaterRipple 
              style={styles.statsButton}
              onPress={() => Alert.alert(
                "Game Stats",
                `Correct Words: ${gameStats.correctWords}\nTotal Attempts: ${gameStats.totalAttempts}\nHints Used: ${gameStats.hintsUsed}\nPerfect Words: ${gameStats.perfectWords}`,
                [{ text: "OK" }]
              )}
            >
              <Ionicons name="stats-chart" size={20} color="#4FC3F7" />
            </WaterRipple>
          </View>
          
          {/* Level Progress */}
          <LevelProgressBar currentLevel={level} totalLevels={wordData.length} />
          
          {/* Game Info */}
          <View style={styles.gameInfo}>
            <Animated.View 
              style={[styles.scoreContainer, { transform: [{ scale: bounceAnim }] }]}
            >
              <Ionicons name="water" size={18} color="#4FC3F7" style={styles.infoIcon} />
              <ReadableText style={styles.scoreLabel} readable={true} priority={2}>
                Score
              </ReadableText>
              <ReadableText style={styles.scoreValue} readable={true} priority={3}>
                {score}
              </ReadableText>
            </Animated.View>
            
            <Animated.View 
              style={[styles.streakContainer, 
                { 
                  transform: [{ scale: streakAnim }],
                  backgroundColor: streakCount >= 3 ? 'rgba(156, 39, 176, 0.6)' : 'rgba(13, 71, 161, 0.6)',
                  borderColor: streakCount >= 3 ? '#E040FB' : '#4FC3F7',
                }
              ]}
            >
              <FontAwesome5 name={streakCount >= 3 ? "fire" : "tint"} size={18} color={streakCount >= 3 ? '#E040FB' : '#4FC3F7'} style={styles.infoIcon} />
              <ReadableText style={styles.streakLabel} readable={true} priority={4}>
                Streak
              </ReadableText>
              <ReadableText style={[styles.streakValue, streakCount >= 3 && styles.hotStreakValue]} readable={true} priority={5}>
                {streakCount}
              </ReadableText>
            </Animated.View>
          </View>
          
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Level Intro Animation */}
            {showLevelIntro && (
              <Animated.View 
                style={[
                  styles.levelIntroContainer,
                  {
                    opacity: levelIntroAnim,
                    transform: [
                      { scale: levelIntroAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.8, 1.1, 1]
                        }) 
                      }
                    ]
                  }
                ]}
              >
                <LinearGradient
                  colors={['#1976D2', '#64B5F6', '#1976D2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.levelIntroGradient}
                >
                  <MaterialCommunityIcons name="wave" size={50} color="#ffffff" />
                  <ReadableText style={styles.levelIntroText} readable={true}>
                    Level {level + 1}
                  </ReadableText>
                  <ReadableText style={styles.levelIntroCategory} readable={true}>
                    {wordData[level][0].category}
                  </ReadableText>
                </LinearGradient>
              </Animated.View>
            )}
            
            {/* Game Instructions */}
            <LinearGradient
              colors={['#1976D2', '#64B5F6', '#1976D2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.instructionsCard}
            >
              <ReadableText style={styles.instructionsText} readable={true} priority={6}>
                Listen to the word and spell it correctly in the box below.
              </ReadableText>
              <View style={styles.glassReflection} />
            </LinearGradient>
            
            {/* Word Challenge */}
            {currentWord && (
              <Animated.View style={[
                styles.challengeContainer,
                { transform: [{ scale: pulseAnim }, { scale: containerScaleAnim }] }
              ]}>
                {/* Category and Difficulty Row */}
                <View style={styles.wordInfoRow}>
                  <View style={styles.categoryBadge}>
                    <ReadableText style={styles.categoryText} readable={true} priority={8}>
                      {currentWord.category}
                    </ReadableText>
                    <View style={styles.dropletEffect} />
                  </View>
                  
                  <DifficultyBadge difficulty={currentDifficulty} />
                </View>
                
                <WaterRipple 
                  style={styles.speakButton}
                  onPress={speakWord}
                >
                  <LinearGradient
                    colors={['#29B6F6', '#0288D1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.speakButtonGradient}
                  >
                    <Feather name="volume-2" size={24} color="#E3F2FD" />
                    <ReadableText style={styles.speakButtonText} readable={true} priority={7}>
                      Hear Word
                    </ReadableText>
                  </LinearGradient>
                  <View style={styles.speakButtonRipple} />
                </WaterRipple>
                
                {/* Word Progress */}
                <View style={styles.wordProgressContainer}>
                  <ReadableText style={styles.wordProgressText} readable={true}>
                    Word {currentWordIndex + 1} of {wordData[level].length}
                  </ReadableText>
                  <View style={styles.wordProgressBar}>
                    <View style={[styles.wordProgressFill, { 
                      width: `${((currentWordIndex) / wordData[level].length) * 100}%` 
                    }]} />
                  </View>
                </View>
                
                {/* Hint Button */}
                <WaterRipple 
                  style={styles.hintButton}
                  onPress={getNextHint}
                >
                  <Ionicons name="water-outline" size={20} color="#1976D2" />
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
                </WaterRipple>
                
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
                    <View style={styles.glassReflection} />
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
                    style={[
                      styles.input, 
                      { 
                        fontFamily: textStyle.fontFamily,
                        color: '#FFFFFF' 
                      }
                    ]}
                    value={userInput}
                    onChangeText={setUserInput}
                    placeholder="Type your answer here"
                    placeholderTextColor="#8BAED1"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleSubmit}
                  />
                  <View style={styles.inputReflection} />
                </Animated.View>
                
                <WaterRipple 
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <LinearGradient
                    colors={['#2196F3', '#0D47A1']}
                    style={styles.submitButtonGradient}
                  >
                    <ReadableText style={styles.submitButtonText} readable={true} priority={10}>
                      Submit
                    </ReadableText>
                  </LinearGradient>
                </WaterRipple>
                
                {/* Bubble Effect */}
                {Array(6).fill().map((_, i) => (
                  <Animated.View 
                    key={i}
                    style={[
                      styles.bubble,
                      {
                        left: `${10 + i * 15}%`,
                        bottom: 10 + (i % 3) * 15,
                        width: 8 + (i % 4) * 4,
                        height: 8 + (i % 4) * 4,
                        opacity: Animated.multiply(
                          bubbleAnim,
                          Math.random() * 0.5 + 0.3
                        ),
                        transform: [
                          { 
                            translateY: Animated.multiply(
                              bubbleAnim,
                              new Animated.Value(-(Math.random() * 50 + 20))
                            ) 
                          },
                          { scale: Animated.add(1, Animated.multiply(bubbleAnim, 0.5)) }
                        ]
                      }
                    ]}
                  />
                ))}
              </Animated.View>
            )}
            
            {/* Feedback */}
            {showFeedback && (
              <View style={styles.feedbackContainer}>
                <Animated.View style={[
                  styles.feedbackBubble,
                  isCorrect ? styles.correctFeedbackBubble : styles.wrongFeedbackBubble
                ]}>
                  <ReadableText 
                    style={[styles.feedbackText, isCorrect ? styles.correctFeedback : styles.wrongFeedback]} 
                    readable={true} 
                    priority={11}
                  >
                    {isCorrect ? 'Correct!' : 'Try Again!'}
                  </ReadableText>
                  {isCorrect && currentWord && (
                    <ReadableText style={styles.feedbackWordText} readable={true}>
                      {currentWord.word}
                    </ReadableText>
                  )}
                </Animated.View>
                {isCorrect && (
                  <View style={styles.splashContainer}>
                    {Array(6).fill().map((_, i) => (
                      <View key={i} style={[styles.splashDrop, {
                        width: Math.random() * 20 + 10,
                        height: Math.random() * 20 + 10,
                        left: `${i * 15 + 5}%`,
                        top: Math.random() * 30,
                      }]} />
                    ))}
                  </View>
                )}
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
  waterBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  waterWave: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: height * 0.5,
    backgroundColor: 'rgba(41, 121, 255, 0.05)',
    borderTopLeftRadius: 300,
    borderTopRightRadius: 300,
  },
  container: {
    flex: 1,
    backgroundColor: '#0A1929', // Deep ocean blue
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
    backgroundColor: 'rgba(13, 71, 161, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#1565C0',
    zIndex: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(25, 118, 210, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E3F2FD',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  placeholder: {
    width: 44,
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    zIndex: 2,
  },
  infoIcon: {
    marginBottom: 5,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(13, 71, 161, 0.6)',
    padding: 15,
    borderRadius: 15,
    borderColor: '#4FC3F7',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    minWidth: width * 0.25,
    overflow: 'hidden',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#E3F2FD',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4FC3F7',
  },
  levelContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(13, 71, 161, 0.6)',
    padding: 15,
    borderRadius: 15,
    borderColor: '#4FC3F7',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    minWidth: width * 0.25,
    overflow: 'hidden',
  },
  levelLabel: {
    fontSize: 14,
    color: '#E3F2FD',
    marginBottom: 5,
  },
  levelValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4FC3F7',
  },
  instructionsCard: {
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    overflow: 'hidden',
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  instructionsText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  glassReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  challengeContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: 'rgba(41, 121, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4FC3F7',
    zIndex: 2,
    overflow: 'hidden',
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 195, 247, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#4FC3F7',
    overflow: 'hidden',
  },
  speakButtonRipple: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  speakButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#E3F2FD',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
  },
  hintButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#4FC3F7',
  },
  categoryBadge: {
    backgroundColor: 'rgba(79, 195, 247, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#4FC3F7',
    position: 'relative',
    overflow: 'hidden',
  },
  dropletEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E3F2FD',
  },
  hintContainer: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  hintLevel1: {
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
    borderColor: '#4FC3F7',
    borderWidth: 1,
  },
  hintLevel2: {
    backgroundColor: 'rgba(79, 195, 247, 0.15)',
    borderColor: '#29B6F6',
    borderWidth: 1,
  },
  hintLevel3: {
    backgroundColor: 'rgba(79, 195, 247, 0.2)',
    borderColor: '#03A9F4',
    borderWidth: 1,
  },
  hintText: {
    fontSize: 14,
    color: '#E3F2FD',
    textAlign: 'center',
  },
  pointsText: {
    fontSize: 12,
    color: '#4FC3F7',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold',
  },
  hintLevelIndicator: {
    backgroundColor: '#03A9F4',
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
    color: '#E3F2FD',
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(41, 121, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4FC3F7',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4FC3F7',
    borderRadius: 4,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  input: {
    backgroundColor: 'rgba(25, 118, 210, 0.3)',
    borderWidth: 1,
    borderColor: '#4FC3F7',
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    width: '100%',
    textAlign: 'center',
    color: '#E3F2FD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  inputReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  submitButton: {
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  feedbackContainer: {
    marginTop: 15,
    alignItems: 'center',
    zIndex: 2,
    position: 'relative',
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  correctFeedback: {
    color: '#4CAF50',
  },
  wrongFeedback: {
    color: '#FF5252',
  },
  splashContainer: {
    position: 'absolute',
    width: '100%',
    height: 50,
    top: -20,
    overflow: 'visible',
  },
  splashDrop: {
    position: 'absolute',
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderRadius: 50,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 50,
  },
  statsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(25, 118, 210, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  streakContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(13, 71, 161, 0.6)',
    padding: 15,
    borderRadius: 15,
    borderColor: '#4FC3F7',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    minWidth: width * 0.25,
    overflow: 'hidden',
  },
  streakLabel: {
    fontSize: 14,
    color: '#E3F2FD',
    marginBottom: 5,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4FC3F7',
  },
  hotStreakValue: {
    color: '#E040FB',
    textShadowColor: 'rgba(224, 64, 251, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  levelProgressContainer: {
    marginHorizontal: 20,
    marginTop: 5,
  },
  levelProgressText: {
    fontSize: 12,
    color: '#E3F2FD',
    textAlign: 'center',
    marginBottom: 5,
  },
  levelProgressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 8,
  },
  levelProgressItem: {
    height: 8,
    marginHorizontal: '0.5%',
    borderRadius: 4,
  },
  wordProgressContainer: {
    width: '100%',
    marginBottom: 15,
    marginTop: 5,
  },
  wordProgressText: {
    fontSize: 12,
    color: '#E3F2FD',
    textAlign: 'center',
    marginBottom: 5,
  },
  wordProgressBar: {
    height: 4,
    backgroundColor: 'rgba(41, 121, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  wordProgressFill: {
    height: '100%',
    backgroundColor: '#29B6F6',
    borderRadius: 2,
  },
  levelIntroContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(10, 25, 41, 0.7)',
  },
  levelIntroGradient: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  levelIntroText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  levelIntroCategory: {
    fontSize: 18,
    color: 'white',
    marginTop: 5,
    opacity: 0.9,
  },
  wordInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  speakButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
  },
  feedbackBubble: {
    padding: 15,
    borderRadius: 20,
    minWidth: width * 0.5,
    alignItems: 'center',
  },
  correctFeedbackBubble: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  wrongFeedbackBubble: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  feedbackWordText: {
    fontSize: 16,
    color: '#E3F2FD',
    marginTop: 5,
  },
});

export default SpellingChallengeGame;
