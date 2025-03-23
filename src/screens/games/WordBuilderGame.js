import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useTextStyle } from '../../hooks/useTextStyle';
import DraggableSyllable from '../../components/games/DraggableSyllable';
import { wordLevels } from '../../data/wordBuilderData';

const { width, height } = Dimensions.get('window');

const WordBuilderGame = () => {
  const navigation = useNavigation();
  const textStyle = useTextStyle();
  const [level, setLevel] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(null);
  const [syllables, setSyllables] = useState([]);
  const [placedSyllables, setPlacedSyllables] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(false);
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const imageAnim = useRef(new Animated.Value(0.95)).current;

  // Load word data for current level
  useEffect(() => {
    if (level < wordLevels.length) {
      loadNewWord();
    }
  }, [level, currentWordIndex]);

  // Setup animation loop for image
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(imageAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(imageAnim, {
          toValue: 0.95,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadNewWord = () => {
    const levelData = wordLevels[level];
    if (currentWordIndex < levelData.words.length) {
      const word = levelData.words[currentWordIndex];
      setCurrentWord(word);
      
      // Create syllable objects with unique IDs
      const syllableObjects = word.syllables.map((syl, index) => ({
        id: `${syl}-${index}`,
        text: syl,
        isPlaced: false,
      }));
      
      // Shuffle the syllables
      const shuffledSyllables = shuffleArray([...syllableObjects]);
      
      setSyllables(shuffledSyllables);
      setPlacedSyllables([]);
      setIsCorrect(false);
      setHint(false);
    } else if (level < wordLevels.length - 1) {
      // Move to next level
      setLevel(level + 1);
      setCurrentWordIndex(0);
    } else {
      // Game completed
      alert("Congratulations! You've completed all levels!");
    }
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handlePlaceSyllable = (syllableId) => {
    const syllableToPlace = syllables.find(s => s.id === syllableId && !s.isPlaced);
    
    if (syllableToPlace) {
      const updatedSyllables = syllables.map(s => 
        s.id === syllableId ? { ...s, isPlaced: true } : s
      );
      
      setSyllables(updatedSyllables);
      setPlacedSyllables([...placedSyllables, syllableToPlace]);
      
      // Check if word is complete
      if (placedSyllables.length + 1 === currentWord.syllables.length) {
        checkAnswer([...placedSyllables, syllableToPlace]);
      }
    }
  };

  const handleRemoveSyllable = (index) => {
    const syllableToRemove = placedSyllables[index];
    const updatedPlaced = placedSyllables.filter((_, i) => i !== index);
    
    const updatedSyllables = syllables.map(s => 
      s.id === syllableToRemove.id ? { ...s, isPlaced: false } : s
    );
    
    setSyllables(updatedSyllables);
    setPlacedSyllables(updatedPlaced);
    setIsCorrect(false);
  };

  const checkAnswer = (placed) => {
    const userWord = placed.map(s => s.text).join('');
    const correctWord = currentWord.word;
    
    setAttempts(attempts + 1);
    
    if (userWord.toLowerCase() === correctWord.toLowerCase()) {
      setIsCorrect(true);
      setScore(score + Math.max(10 - attempts, 1));
      
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
      Speech.speak(correctWord, {
        language: 'en',
        pitch: 1,
        rate: 0.8,
      });
      
      // Move to next word after delay
      setTimeout(() => {
        setCurrentWordIndex(currentWordIndex + 1);
        setAttempts(0);
        setIsCorrect(false);
      }, 2500);
    } else {
      // Wrong answer animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Reset placed syllables after wrong answer
      const resetSyllables = syllables.map(s => ({ ...s, isPlaced: false }));
      setSyllables(resetSyllables);
      setPlacedSyllables([]);
    }
  };

  const showHintHandler = () => {
    setHint(true);
    Speech.speak(currentWord.word, {
      language: 'en',
      pitch: 1,
      rate: 0.8,
    });
    
    setTimeout(() => {
      setHint(false);
    }, 2000);
  };

  const resetGame = () => {
    setLevel(0);
    setCurrentWordIndex(0);
    setScore(0);
    setAttempts(0);
  };

  if (!currentWord) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { fontFamily: textStyle.fontFamily }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      <LinearGradient
        colors={['#6C63FF', '#3F3D9D']}
        style={styles.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { fontFamily: textStyle.fontFamily }]}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, { fontFamily: textStyle.fontFamily }]}>
            Score: {score}
          </Text>
          <Text style={[styles.levelText, { fontFamily: textStyle.fontFamily }]}>
            Level: {level + 1}
          </Text>
        </View>
      </View>
      
      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* Word Image */}
        <Animated.View 
          style={[
            styles.imageContainer, 
            { transform: [{ scale: imageAnim }] }
          ]}
        >
          <Image 
            source={{ uri: currentWord.imageUrl }} 
            style={styles.wordImage} 
            resizeMode="contain"
          />
        </Animated.View>
        
        {/* Word Assembly Area */}
        <Animated.View 
          style={[
            styles.wordContainer, 
            isCorrect && { backgroundColor: 'rgba(76, 217, 100, 0.2)' },
            { opacity: fadeAnim, transform: [{ scale: bounceAnim }] }
          ]}
        >
          <View style={styles.placeholderRow}>
            {currentWord.syllables.map((_, index) => (
              <View 
                key={`placeholder-${index}`} 
                style={[
                  styles.placeholder,
                  placedSyllables[index] ? styles.placeholderFilled : {},
                  hint && index === 0 ? styles.placeholderHint : {}
                ]}
              >
                {placedSyllables[index] && (
                  <TouchableOpacity
                    style={styles.placedSyllable}
                    onPress={() => handleRemoveSyllable(index)}
                  >
                    <Text 
                      style={[
                        styles.syllableText, 
                        { fontFamily: textStyle.fontFamily || 'OpenDyslexic-Regular' }
                      ]}
                    >
                      {placedSyllables[index].text}
                    </Text>
                  </TouchableOpacity>
                )}
                {hint && index === 0 && !placedSyllables[0] && (
                  <Text 
                    style={[
                      styles.hintText, 
                      { fontFamily: textStyle.fontFamily || 'OpenDyslexic-Regular' }
                    ]}
                  >
                    {currentWord.syllables[0]}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </Animated.View>
        
        {/* Available Syllables */}
        <View style={styles.syllablesContainer}>
          {syllables.map((syllable) => (
            !syllable.isPlaced && (
              <DraggableSyllable
                key={syllable.id}
                syllable={syllable}
                onPress={() => handlePlaceSyllable(syllable.id)}
                textStyle={textStyle}
              />
            )
          ))}
        </View>
        
        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.hintButton}
            onPress={showHintHandler}
          >
            <Text style={[styles.buttonText, { fontFamily: textStyle.fontFamily }]}>
              Hint
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetGame}
          >
            <Text style={[styles.buttonText, { fontFamily: textStyle.fontFamily }]}>
              Restart
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Success Overlay - Using static image instead of animation */}
      {isCorrect && (
        <View style={styles.successOverlay}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2377/2377830.png' }}
            style={styles.successImage}
            resizeMode="contain"
          />
          <Text 
            style={[
              styles.correctWordText, 
              { fontFamily: textStyle.fontFamily || 'OpenDyslexic-Regular' }
            ]}
          >
            {currentWord.word}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#3F3D9D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 18,
    marginRight: 15,
  },
  levelText: {
    color: '#fff',
    fontSize: 18,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  wordImage: {
    width: '90%',
    height: '90%',
    borderRadius: 15,
  },
  wordContainer: {
    width: '90%',
    minHeight: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderStyle: 'dashed',
    borderRadius: 10,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderFilled: {
    borderStyle: 'solid',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  placeholderHint: {
    borderColor: '#FF9500',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  placedSyllable: {
    width: '100%',
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    color: '#FF9500',
    fontSize: 20,
    fontWeight: 'bold',
  },
  syllableText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  syllablesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  hintButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#FF9500',
    borderRadius: 25,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#FF3B30',
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  successImage: {
    width: 150,
    height: 150,
  },
  correctWordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3F3D9D',
    textAlign: 'center',
    padding: 20,
  },
});

export default WordBuilderGame;
