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
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Import TextReaderRoot and ReadableText for accessibility
import TextReaderRoot from '../../components/TextReaderRoot';
import ReadableText from '../../components/ReadableText';

// Import useTextStyle hook for applying text styling from settings
import { useTextStyle } from '../../hooks/useTextStyle';

const { width, height } = Dimensions.get('window');
const CARD_SIZE = width * 0.2;
const CARD_MARGIN = 10;

// Card themes for matching
const cardThemes = {
  animals: [
    { id: 1, image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'cat' },
    { id: 2, image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'dog' },
    { id: 3, image: 'https://images.unsplash.com/photo-1484406566174-9da000fda645?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'elephant' },
    { id: 4, image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'fox' },
    { id: 5, image: 'https://images.unsplash.com/photo-1497752531616-c3afd9760a11?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'raccoon' },
    { id: 6, image: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'turtle' },
  ],
  nature: [
    { id: 7, image: 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'sun' },
    { id: 8, image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'flower' },
    { id: 9, image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'tree' },
    { id: 10, image: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'mountain' },
    { id: 11, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'beach' },
    { id: 12, image: 'https://images.unsplash.com/photo-1546514355-7fdc90ccbd03?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'river' },
  ],
  food: [
    { id: 13, image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'apple' },
    { id: 14, image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'banana' },
    { id: 15, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'pizza' },
    { id: 16, image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'icecream' },
    { id: 17, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'burger' },
    { id: 18, image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', name: 'donut' },
  ],
};

const MemoryMatchGame = () => {
  const navigation = useNavigation();
  const textStyle = useTextStyle();
  // Add the state here inside the component
  const [currentTheme, setCurrentTheme] = useState('animals');
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  
  // Get card images based on current theme
  const cardImages = cardThemes[currentTheme];
  
  const flipAnimation = useRef({}).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  
  // Initialize game
  useEffect(() => {
    initializeGame();
  }, [level]);
  
  const initializeGame = () => {
    // Reset game state
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setGameStarted(false);
    setGameCompleted(false);
    
    // Determine number of pairs based on level
    const numPairs = Math.min(level + 2, cardImages.length);
    
    // Create pairs of cards
    let selectedCards = cardImages.slice(0, numPairs);
    let cardPairs = [];
    
    selectedCards.forEach(card => {
      // Add two of each card
      cardPairs.push({
        id: `${card.id}-1`,
        imageUrl: card.image,
        name: card.name,
        matched: false,
        flipped: false,
        matchId: card.id
      });
      
      cardPairs.push({
        id: `${card.id}-2`,
        imageUrl: card.image,
        name: card.name,
        matched: false,
        flipped: false,
        matchId: card.id
      });
    });
    
    // Shuffle cards
    cardPairs = shuffleArray(cardPairs);
    
    // Initialize flip animations for each card
    cardPairs.forEach(card => {
      flipAnimation[card.id] = new Animated.Value(0);
    });
    
    setCards(cardPairs);
  };
  
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  const handleCardPress = (index) => {
    // Start game on first card flip
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    // Ignore if card is already flipped or matched
    if (
      flippedIndices.includes(index) || 
      matchedPairs.includes(cards[index].matchId) ||
      flippedIndices.length >= 2
    ) {
      return;
    }
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Flip the card
    flipCard(index, true);
    
    // Add to flipped indices
    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);
    
    // Check for match if two cards are flipped
    if (newFlippedIndices.length === 2) {
      setMoves(moves + 1);
      
      const [firstIndex, secondIndex] = newFlippedIndices;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];
      
      if (firstCard.matchId === secondCard.matchId) {
        // Match found
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Update matched pairs
        setMatchedPairs([...matchedPairs, firstCard.matchId]);
        
        // Update score
        setScore(score + 10);
        
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
        
        // Reset flipped indices
        setFlippedIndices([]);
        
        // Check if game is completed
        if (matchedPairs.length + 1 === cards.length / 2) {
          handleGameComplete();
        }
      } else {
        // No match
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        // Flip cards back after delay
        setTimeout(() => {
          flipCard(firstIndex, false);
          flipCard(secondIndex, false);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };
  
  const flipCard = (index, isFlipped) => {
    const cardId = cards[index].id;
    
    Animated.timing(flipAnimation[cardId], {
      toValue: isFlipped ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Update card state
    const updatedCards = [...cards];
    updatedCards[index].flipped = isFlipped;
    setCards(updatedCards);
  };
  
  const handleGameComplete = () => {
    setGameCompleted(true);
    
    // Calculate final score based on moves and level
    const finalScore = score + (level * 20) - (moves * 2);
    setScore(Math.max(finalScore, 0));
    
    // Show completion alert
    setTimeout(() => {
      Alert.alert(
        "Level Complete!",
        `You completed level ${level} with ${moves} moves and scored ${Math.max(finalScore, 0)} points!`,
        [
          { 
            text: "Next Level", 
            onPress: () => {
              setLevel(level + 1);
            }
          },
          {
            text: "Replay",
            onPress: () => initializeGame(),
            style: "cancel"
          }
        ]
      );
    }, 500);
  };
  
  const renderCard = (card, index) => {
    const isFlipped = flippedIndices.includes(index) || matchedPairs.includes(card.matchId);
    
    // Interpolate flip animation
    const frontInterpolate = flipAnimation[card.id]?.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    }) || '0deg';
    
    const backInterpolate = flipAnimation[card.id]?.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg'],
    }) || '180deg';
    
    const frontAnimatedStyle = {
      transform: [{ rotateY: frontInterpolate }],
    };
    
    const backAnimatedStyle = {
      transform: [{ rotateY: backInterpolate }],
    };
    
    return (
      <TouchableOpacity
        key={card.id}
        style={styles.cardContainer}
        onPress={() => handleCardPress(index)}
        activeOpacity={0.9}
      >
        {/* Front of card (hidden) */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            frontAnimatedStyle,
            matchedPairs.includes(card.matchId) && styles.matchedCard
          ]}
        >
          <BlurView intensity={10} style={styles.cardBlur}>
            <Feather name="help-circle" size={32} color="#FF6B6B" />
          </BlurView>
        </Animated.View>
        
        {/* Back of card (image) */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            backAnimatedStyle,
            matchedPairs.includes(card.matchId) && styles.matchedCard
          ]}
        >
          <Image
            source={{ uri: card.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </Animated.View>
      </TouchableOpacity>
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
          <ReadableText style={styles.headerTitle} readable={true} priority={1}>
            Memory Match
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
              {level}
            </ReadableText>
          </View>
          
          <View style={styles.movesContainer}>
            <ReadableText style={styles.movesLabel} readable={true} priority={6}>
              Moves
            </ReadableText>
            <ReadableText style={styles.movesValue} readable={true} priority={7}>
              {moves}
            </ReadableText>
          </View>
        </View>
        
        {/* Game Instructions */}
        <LinearGradient
          colors={['#FF9F9F', '#FF6B6B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.instructionsCard}
        >
          <ReadableText style={styles.instructionsText} readable={true} priority={8}>
            Flip cards to find matching pairs. Complete the level with fewer moves for a higher score!
          </ReadableText>
        </LinearGradient>
        
        {/* Game Board */}
        <View style={styles.gameBoard}>
          {cards.map((card, index) => renderCard(card, index))}
        </View>
        
        {/* Theme Selector */}
        <View style={styles.themeContainer}>
          <ReadableText style={styles.themeTitle} readable={true} priority={9}>
            Card Theme:
          </ReadableText>
          <View style={styles.themeButtonsContainer}>
            <TouchableOpacity 
              style={[styles.themeButton, currentTheme === 'animals' && styles.themeButtonActive]}
              onPress={() => {
                setCurrentTheme('animals');
                setLevel(1); // Reset level when changing theme
              }}
            >
              <ReadableText style={styles.themeButtonText} readable={true} priority={10}>
                Animals
              </ReadableText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.themeButton, currentTheme === 'nature' && styles.themeButtonActive]}
              onPress={() => {
                setCurrentTheme('nature');
                setLevel(1); // Reset level when changing theme
              }}
            >
              <ReadableText style={styles.themeButtonText} readable={true} priority={11}>
                Nature
              </ReadableText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.themeButton, currentTheme === 'food' && styles.themeButtonActive]}
              onPress={() => {
                setCurrentTheme('food');
                setLevel(1); // Reset level when changing theme
              }}
            >
              <ReadableText style={styles.themeButtonText} readable={true} priority={12}>
                Food
              </ReadableText>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Reset Button */}
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={initializeGame}
        >
          <Feather name="refresh-cw" size={20} color="#fff" />
          <ReadableText style={styles.resetButtonText} readable={true} priority={13}>
            Reset Game
          </ReadableText>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
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
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  levelContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
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
  },
  levelValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  movesContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: width * 0.25,
  },
  movesLabel: {
    fontSize: 14,
    color: '#666',
  },
  movesValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  instructionsCard: {
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  instructionsText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
  },
  gameBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    flex: 1,
  },
  cardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    margin: CARD_MARGIN,
    perspective: 1000,
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cardFront: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBack: {
    backgroundColor: '#fff',
  },
  cardBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  matchedCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  resetButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  themeContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  themeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: width * 0.25,
    alignItems: 'center',
  },
  themeButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

export default MemoryMatchGame;