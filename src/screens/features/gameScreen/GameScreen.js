import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { db } from '../../../../firebase-script/scrambleFirebase';
import { collection, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';

// Word list for the game
const WORD_LIST = [
  'apple', 'banana', 'cherry', 'dolphin', 'elephant', 
  'flower', 'giraffe', 'house', 'island', 'jungle',
  'kangaroo', 'lemon', 'monkey', 'notebook', 'orange',
  'penguin', 'queen', 'rainbow', 'sunshine', 'tiger',
  'umbrella', 'violin', 'window', 'xylophone', 'yellow',
  'zebra', 'bread', 'cloud', 'dream', 'earth'
];

// Function to scramble a word
const scrambleWord = (word) => {
  const wordArray = word.split('');
  for (let i = wordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
  }
  
  // Make sure the scrambled word is different from the original
  const scrambled = wordArray.join('');
  if (scrambled === word) {
    return scrambleWord(word);
  }
  
  return scrambled;
};

// Get a random word from the list
const getRandomWord = () => {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
};

const GameScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackColor, setFeedbackColor] = useState('#333');
  
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const bounceAnimation = useRef(new Animated.Value(1)).current;
  
  // Start a new game
  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameActive(true);
    setFeedback('');
    nextWord();
  };
  
  // Load the next word
  const nextWord = () => {
    const word = getRandomWord();
    setCurrentWord(word);
    setScrambledWord(scrambleWord(word));
    setUserInput('');
    
    // Animate the new word appearing
    Animated.sequence([
      Animated.timing(bounceAnimation, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnimation, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Check the user's answer
  const checkAnswer = () => {
    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedWord = currentWord.trim().toLowerCase();
    
    if (normalizedInput === normalizedWord) {
      // Correct answer
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setScore(prevScore => prevScore + 10);
      setFeedback('Correct!');
      setFeedbackColor('#4CAF50');
      nextWord();
    } else {
      // Wrong answer
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      setFeedback('Try again!');
      setFeedbackColor('#F44336');
      
      // Shake animation for wrong answer
      Animated.sequence([
        Animated.timing(shakeAnimation, { 
          toValue: 10, 
          duration: 100, 
          useNativeDriver: true 
        }),
        Animated.timing(shakeAnimation, { 
          toValue: -10, 
          duration: 100, 
          useNativeDriver: true 
        }),
        Animated.timing(shakeAnimation, { 
          toValue: 10, 
          duration: 100, 
          useNativeDriver: true 
        }),
        Animated.timing(shakeAnimation, { 
          toValue: 0, 
          duration: 100, 
          useNativeDriver: true 
        })
      ]).start();
    }
  };
  
  // Get a hint (first letter)
  const getHint = () => {
    if (score >= 5) {
      setScore(prevScore => prevScore - 5);
      Alert.alert('Hint', `The word starts with "${currentWord[0]}"`);
    } else {
      Alert.alert('Not enough points', 'You need at least 5 points to get a hint');
    }
  };
  
  // Skip the current word
  const skipWord = () => {
    if (score >= 2) {
      setScore(prevScore => prevScore - 2);
      nextWord();
    } else {
      Alert.alert('Not enough points', 'You need at least 2 points to skip a word');
    }
  };
  
  // End the game and save score
  const endGame = async () => {
    setGameActive(false);
    
    try {
      // Get or create user stats document
      const userStatsRef = doc(db, 'userStats', user.uid);
      const userStatsDoc = await getDoc(userStatsRef);
      
      if (userStatsDoc.exists()) {
        // Update existing stats
        const currentStats = userStatsDoc.data();
        await updateDoc(userStatsRef, {
          gamesPlayed: increment(1),
          totalScore: increment(score),
          highScore: Math.max(currentStats.highScore || 0, score)
        });
      } else {
        // Create new stats document
        await setDoc(userStatsRef, {
          userId: user.uid,
          userEmail: user.email,
          gamesPlayed: 1,
          totalScore: score,
          highScore: score
        });
      }
      
      // Save this game session
      const gameSessionRef = doc(collection(db, 'gameSessions'));
      await setDoc(gameSessionRef, {
        userId: user.uid,
        score: score,
        playedAt: new Date(),
      });
      
      Alert.alert(
        'Game Over',
        `Your final score is ${score}`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      console.error('Error saving score:', error);
      Alert.alert('Error', 'Failed to save your score');
    }
  };
  
  // Timer countdown
  useEffect(() => {
    let timer;
    if (gameActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }
    
    return () => clearTimeout(timer);
  }, [timeLeft, gameActive]);
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {!gameActive ? (
        <View style={styles.startContainer}>
          <Text style={styles.gameTitle}>Word Scramble</Text>
          <Text style={styles.instructions}>
            Unscramble the letters to form the correct word.
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameContainer}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Score</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Time</Text>
              <Text style={[styles.statValue, timeLeft <= 10 ? styles.timeWarning : null]}>
                {timeLeft}s
              </Text>
            </View>
          </View>
          
          <View style={styles.wordContainer}>
            <Text style={styles.promptText}>Unscramble this word:</Text>
            <Animated.Text 
              style={[
                styles.scrambledWord,
                { 
                  transform: [
                    { translateX: shakeAnimation },
                    { scale: bounceAnimation }
                  ] 
                }
              ]}
            >
              {scrambledWord.toUpperCase()}
            </Animated.Text>
          </View>
          
          {feedback ? (
            <Text style={[styles.feedback, { color: feedbackColor }]}>
              {feedback}
            </Text>
          ) : null}
          
          <TextInput
            style={styles.input}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Type your answer"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={checkAnswer}
          />
          
          <TouchableOpacity style={styles.checkButton} onPress={checkAnswer}>
            <Text style={styles.checkButtonText}>Check Answer</Text>
          </TouchableOpacity>
          
          <View style={styles.helpButtonsContainer}>
            <TouchableOpacity style={styles.helpButton} onPress={getHint}>
              <Text style={styles.helpButtonText}>Hint (-5 pts)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.helpButton} onPress={skipWord}>
              <Text style={styles.helpButtonText}>Skip (-2 pts)</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4a6ea9',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#4a6ea9',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a6ea9',
  },
  timeWarning: {
    color: '#f44336',
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  promptText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  scrambledWord: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 8,
    color: '#4a6ea9',
  },
  feedback: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  checkButton: {
    backgroundColor: '#4a6ea9',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helpButton: {
    backgroundColor: 'rgba(74, 110, 169, 0.2)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    width: '48%',
  },
  helpButtonText: {
    color: '#4a6ea9',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GameScreen;