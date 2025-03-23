import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const COLORS = {
  primary: "#6200ee",
  background: "#f8f8f8",
  card: "#ffffff",
  text: "#333333",
  success: "#4caf50",
  error: "#f44336",
  skip: "#ff9800",
  yellow: "#ffeb3b",
  border: "#e0e0e0",
};

export default function TestScreen({ flashcards, setActiveTab, timer }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0, skipped: 0 });
  const [flipAnim] = useState(new Animated.Value(0));
  const [timeLeft, setTimeLeft] = useState(timer);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setScore({ correct: 0, wrong: 0, skipped: 0 });
    flipAnim.setValue(0);
    setTimeLeft(timer);

    if (timer > 0) {
      const id = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(id);
            showResults(score);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      setIntervalId(id);

      return () => clearInterval(id);
    }
  }, [flashcards, timer]);

  const handleResponse = (response) => {
    const updatedScore = { ...score, [response]: score[response] + 1 };
    setScore(updatedScore);

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      flipAnim.setValue(0);
    } else {
      clearInterval(intervalId);
      showResults(updatedScore);
    }
  };

  const showResults = (updatedScore) => {
    const total = flashcards.length;
    const percentage = Math.round((updatedScore.correct / total) * 100);
    const message = `Score: ${percentage}%\n\nCorrect: ${updatedScore.correct}\nWrong: ${updatedScore.wrong}\nSkipped: ${updatedScore.skipped}`;
    
    if (timeLeft > 0) {
      Alert.alert(
        'Test Complete!',
        `${message}\n\nCongratulations! You finished with ${timeLeft} seconds remaining.`,
        [
          { 
            text: 'Try Again', 
            onPress: () => resetTest() 
          },
          { 
            text: 'Back to Collections',
            onPress: () => setActiveTab('saved')
          }
        ]
      );
    } else {
      Alert.alert(
        'Test Complete!',
        message,
        [
          { 
            text: 'Try Again', 
            onPress: () => resetTest() 
          },
          { 
            text: 'Back to Collections',
            onPress: () => setActiveTab('saved')
          }
        ]
      );
    }
  };

  const resetTest = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setScore({ correct: 0, wrong: 0, skipped: 0 });
    flipAnim.setValue(0);
    setTimeLeft(timer);
    if (timer > 0) {
      const id = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(id);
            showResults(score);
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
    if (timeLeft <= 10) {
      return COLORS.error;
    } else if (timeLeft <= 15) {
      return COLORS.yellow;
    } else {
      return COLORS.primary;
    }
  };

  if (!flashcards.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No flashcards available for testing</Text>
      </View>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = `${currentIndex + 1}/${flashcards.length}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>{progress}</Text>
        <Text style={styles.score}>Score: {score.correct}</Text>
        {timer > 0 && <Text style={styles.timer}>Time Left: {timeLeft}s</Text>}
      </View>
      {timer > 0 && (
        <View style={styles.timerBarContainer}>
          <View style={[styles.timerBarOutline]}>
            <View style={[styles.timerBar, { backgroundColor: getTimerBarColor(), width: `${(timeLeft / timer) * 100}%` }]} />
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.cardContainer} onPress={flipCard}>
        <Animated.View style={[
          styles.card,
          {
            backgroundColor: currentCard.color,
            transform: [{
              rotateY: flipAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg']
              })
            }],
            backfaceVisibility: 'hidden'
          }
        ]}>
          <Text style={styles.cardText}>
            {currentCard.question}
          </Text>
        </Animated.View>
        <Animated.View style={[
          styles.card,
          styles.cardBack,
          {
            backgroundColor: currentCard.color,
            transform: [{
              rotateY: flipAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['180deg', '360deg']
              })
            }],
            backfaceVisibility: 'hidden'
          }
        ]}>
          <Text style={styles.cardText}>
            {currentCard.answer}
          </Text>
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.backButton]}
          onPress={() => setActiveTab('saved')}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.wrongButton]}
          onPress={() => handleResponse('wrong')}
        >
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.correctButton]}
          onPress={() => handleResponse('correct')}
        >
          <Icon name="check" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.skipButton]}
          onPress={() => handleResponse('skipped')}
        >
          <Icon name="skip-next" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  timerBarContainer: {
    height: 20,
    width: '100%',
    marginBottom: 20,
  },
  timerBarOutline: {
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  timerBar: {
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progress: {
    fontSize: 16,
    color: COLORS.text,
  },
  score: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  timer: {
    fontSize: 16,
    color: COLORS.text,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  cardText: {
    fontSize: 18,
    textAlign: 'center',
    color: COLORS.text,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: COLORS.primary,
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
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
});