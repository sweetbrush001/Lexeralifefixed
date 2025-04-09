import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Haptics from "expo-haptics";
import * as Speech from 'expo-speech';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';

const { width, height } = Dimensions.get('window');

// Game data
const GAME_DATA = {
  easy: [
    { word: 'fish', image: require('./assets/images/fish.png') },
    { word: 'crab', image: require('./assets/images/crab.png') },
    { word: 'shark', image: require('./assets/images/shark.png') },
    { word: 'wave', image: require('./assets/images/wave.png') },
    { word: 'boat', image: require('./assets/images/boat.png') },
  ],
  medium: [
    { word: 'starfish', image: require('./assets/images/starfish.png') },
    { word: 'whale', image: require('./assets/images/whale.png') },
    { word: 'coral', image: require('./assets/images/coral.png') },
    { word: 'seashell', image: require('./assets/images/shell.png') },
    { word: 'squid', image: require('./assets/images/squid.png') },
  ],
  hard: [
    { word: 'turtle', image: require('./assets/images/turtle.png') },
    { word: 'octopus', image: require('./assets/images/octopus.png') },
    { word: 'dolphin', image: require('./assets/images/dolphin.png') },
    { word: 'jellyfish', image: require('./assets/images/jellyfish.png') },
    { word: 'seahorse', image: require('./assets/images/seahorse.png') },
  ]
};

// Sound configuration
const SOUNDS = {
  correct: { source: require('./assets/sounds/correct.mp3'), object: null },
  wrong: { source: require('./assets/sounds/incorrect.mp3'), object: null },
  drop: { source: require('./assets/sounds/drop.mp3'), object: null },
  complete: { source: require('./assets/sounds/correct.mp3'), object: null },
  background: { source: require('./assets/sounds/ocean-ambience.mp3'), object: null }
};

const DSpellingGame = () => {
  const navigation = useNavigation();
  const [gameState, setGameState] = useState('splash');
  const [difficulty, setDifficulty] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const [currentHint, setCurrentHint] = useState('');
  const [letters, setLetters] = useState([]);
  const [blanks, setBlanks] = useState([]);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [revealedHint, setRevealedHint] = useState('');
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [letterContainerPosition, setLetterContainerPosition] = useState(null);
  const [droppedLetters, setDroppedLetters] = useState([]);
  const [letterPlaygroundLayout, setLetterPlaygroundLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [availableWords, setAvailableWords] = useState([]);
  const [blankPositions, setBlankPositions] = useState({});
  const [hintsUsedForCurrentWord, setHintsUsedForCurrentWord] = useState(0);

  const animation = useRef(null);
  const correctAnimation = useRef(null);
  const wrongAnimation = useRef(null);
  const splashAnimation = useRef(null);

  // Initialize sounds
  useEffect(() => {
    const loadSounds = async () => {
      try {
        for (const key of Object.keys(SOUNDS)) {
          try {
            const { sound } = await Audio.Sound.createAsync(SOUNDS[key].source);
            SOUNDS[key].object = sound;
          } catch (error) {
            console.log(`Error loading sound ${key}:`, error);
            // Continue with other sounds if one fails
          }
        }
      } catch (error) {
        console.log('Error in loadSounds:', error);
      }
    };

    loadSounds();

    return () => {
      Object.keys(SOUNDS).forEach((key) => {
        if (SOUNDS[key].object) {
          try {
            SOUNDS[key].object.unloadAsync();
          } catch (error) {
            console.log(`Error unloading sound ${key}:`, error);
          }
        }
      });
    };
  }, []);

  // Play sound helper function
  const playSound = async (soundKey) => {
    if (isMuted) return;

    try {
      const sound = SOUNDS[soundKey]?.object;
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.log(`Error playing sound ${soundKey}:`, error);
    }
  };

  // Toggle mute
  const toggleMute = async () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);

    if (SOUNDS.background?.object) {
      try {
        if (newMuteState) {
          await SOUNDS.background.object.pauseAsync();
        } else {
          await SOUNDS.background.object.playAsync();
        }
      } catch (error) {
        console.log('Error toggling mute:', error);
      }
    }
  };

  // Play background music
  const playBackgroundMusic = async () => {
    if (isMuted) return;

    try {
      if (SOUNDS.background?.object) {
        await SOUNDS.background.object.setIsLoopingAsync(true);
        await SOUNDS.background.object.playAsync();
      }
    } catch (error) {
      console.log('Error playing background music:', error);
    }
  };

  // Initialize splash screen
  useEffect(() => {
    if (gameState === 'splash') {
      if (splashAnimation.current) {
        splashAnimation.current.play();
      }

      const timer = setTimeout(() => {
        setGameState('difficulty');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Initialize game when difficulty is selected
  useEffect(() => {
    if (gameState === 'game') {
      setGameOver(false);
      const wordsForThisDifficulty = [...GAME_DATA[difficulty]];

      setTimeout(() => {
        setupGameWithWords(wordsForThisDifficulty);
      }, 300);

      playBackgroundMusic();
    }
  }, [difficulty, gameState]);

  // Check if word is complete to show submit button
  useEffect(() => {
    if (gameState === 'game') {
      const isAnyBlankFilled = blanks.some(blank => blank.filled);
      setShowSubmitButton(isAnyBlankFilled);
    }
  }, [blanks, gameState]);

  const setupGame = () => {
    if (availableWords && availableWords.length > 0) {
      setLetters([]);
      setBlanks([]);
      setDroppedLetters([]);
      setRevealedHint('');
      setBlankPositions({});
      setHintsUsedForCurrentWord(0);

      const randomIndex = Math.floor(Math.random() * availableWords.length);
      const wordData = availableWords[randomIndex];

      const updatedAvailableWords = [...availableWords];
      updatedAvailableWords.splice(randomIndex, 1);
      setAvailableWords(updatedAvailableWords);

      setCurrentWord(wordData.word);
      setCurrentImage(wordData.image);
      setCurrentHint(wordData.hint);

      const totalWords = GAME_DATA[difficulty].length;
      const wordsCompleted = GAME_DATA[difficulty].length - updatedAvailableWords.length;
      setProgress((wordsCompleted / totalWords) * 100);

      const wordLetters = wordData.word.split('');

      const blankSpaces = wordLetters.map((letter, index) => ({
        id: `blank-${index}`,
        letter: letter,
        filled: false,
        filledWithLetterId: null,
      }));

      setBlanks(blankSpaces);

      setTimeout(() => {
        const freshLetters = generateLetterSet(wordLetters);

        setLetters(freshLetters.map(letter => ({
          ...letter,
          hasBeenPositioned: false,
          position: new Animated.ValueXY({ x: -100, y: -100 }),
          originalPosition: { x: -100, y: -100 }
        })));

        setTimeout(() => {
          if (letterPlaygroundLayout.width) {
            positionLetters();
          } else {
            setTimeout(positionLetters, 300);
          }
        }, 100);
      }, 50);

      if (!isMuted) {
        Speech.speak(wordData.word, {
          language: 'en',
          pitch: 1.0,
          rate: 0.75,
        });
      }
    } else {
      endGame();
    }
  };

  const setupGameWithWords = (words) => {
    if (!words || words.length === 0) {
      console.error("No words available for this difficulty!");
      return;
    }

    setLetters([]);
    setBlanks([]);
    setDroppedLetters([]);
    setRevealedHint('');
    setBlankPositions({});
    setHintsUsedForCurrentWord(0);

    setAvailableWords(words);

    const randomIndex = Math.floor(Math.random() * words.length);
    const wordData = words[randomIndex];

    const updatedWords = [...words];
    updatedWords.splice(randomIndex, 1);
    setAvailableWords(updatedWords);

    setCurrentWord(wordData.word);
    setCurrentImage(wordData.image);
    setCurrentHint(wordData.hint);

    const wordLetters = wordData.word.split('');
    const blankSpaces = wordLetters.map((letter, index) => ({
      id: `blank-${index}`,
      letter: letter,
      filled: false,
      filledWithLetterId: null,
    }));

    setBlanks(blankSpaces);

    const totalWords = GAME_DATA[difficulty].length;
    const wordsCompleted = GAME_DATA[difficulty].length - updatedWords.length;
    setProgress((wordsCompleted / totalWords) * 100);

    setTimeout(() => {
      const freshLetters = generateLetterSet(wordLetters);

      setLetters(freshLetters.map(letter => ({
        ...letter,
        hasBeenPositioned: false,
        position: new Animated.ValueXY({ x: -100, y: -100 }),
        originalPosition: { x: -100, y: -100 }
      })));

      setTimeout(positionLetters, 100);
    }, 50);

    if (!isMuted) {
      Speech.speak(wordData.word, {
        language: 'en',
        pitch: 1.0,
        rate: 0.75,
      });
    }
  };

  const generateLetterSet = (wordLetters) => {
    try {
      const uppercaseWordLetters = wordLetters.map(letter => letter.toUpperCase());
      const wordLetterObjects = [];
      const timestamp = Date.now();

      uppercaseWordLetters.forEach((letter, index) => {
        wordLetterObjects.push({
          id: `word-${index}-${timestamp}-${Math.random().toString(36).substring(2, 6)}`,
          letter: letter,
          position: new Animated.ValueXY({ x: 0, y: 0 }),
          originalPosition: { x: 0, y: 0 },
          inDropZone: false,
          used: false,
          isDragging: false,
        });
      });

      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const extraLetterCount = 15 - wordLetterObjects.length;
      const letterCounts = {};
      uppercaseWordLetters.forEach(letter => {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
      });

      const commonLetters = 'ETAOINRSHDLUC';
      const nearLetters = uppercaseWordLetters.flatMap(letter => {
        const charCode = letter.charCodeAt(0);
        const nearChars = [];
        for (let offset = -2; offset <= 2; offset++) {
          if (offset === 0) continue;
          const newChar = String.fromCharCode(charCode + offset);
          if (newChar >= 'A' && newChar <= 'Z') {
            nearChars.push(newChar);
          }
        }
        return nearChars;
      });

      const extraLetters = [];

      for (let i = 0; i < extraLetterCount; i++) {
        let randomLetter;

        if (Math.random() < 0.3 && uppercaseWordLetters.length > 0) {
          randomLetter = uppercaseWordLetters[Math.floor(Math.random() * uppercaseWordLetters.length)];
        }
        else if (Math.random() < 0.7 && nearLetters.length > 0) {
          randomLetter = nearLetters[Math.floor(Math.random() * nearLetters.length)];
        }
        else if (Math.random() < 0.9) {
          randomLetter = commonLetters[Math.floor(Math.random() * commonLetters.length)];
        }
        else {
          randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        }

        const letterCount = letterCounts[randomLetter] || 0;
        if (letterCount >= 3) {
          const availableLetters = alphabet.split('').filter(l => !letterCounts[l] || letterCounts[l] < 2);
          if (availableLetters.length > 0) {
            randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
          }
        }

        letterCounts[randomLetter] = (letterCounts[randomLetter] || 0) + 1;

        extraLetters.push({
          id: `extra-${i}-${timestamp}-${Math.random().toString(36).substring(2, 6)}`,
          letter: randomLetter,
          position: new Animated.ValueXY({ x: 0, y: 0 }),
          originalPosition: { x: 0, y: 0 },
          inDropZone: false,
          used: false,
          isDragging: false,
        });
      }

      const allLetters = [...wordLetterObjects, ...extraLetters];
      return allLetters.sort(() => Math.random() - 0.5);
    } catch (err) {
      console.log("Error generating letter set:", err);
      return fallbackLetterSet(wordLetters);
    }
  };

  const fallbackLetterSet = (wordLetters) => {
    try {
      const timestamp = Date.now();
      const letters = [];

      wordLetters.forEach((letter, index) => {
        letters.push({
          id: `fallback-word-${index}-${timestamp}`,
          letter: letter.toUpperCase(),
          position: new Animated.ValueXY({ x: 0, y: 0 }),
          originalPosition: { x: 0, y: 0 },
          inDropZone: false,
          used: false,
          isDragging: false,
        });
      });

      const extraNeeded = 15 - wordLetters.length;
      const basicLetters = 'AEIOUBCDFGHLMNPRST';

      for (let i = 0; i < extraNeeded; i++) {
        const randomIndex = Math.floor(Math.random() * basicLetters.length);
        letters.push({
          id: `fallback-extra-${i}-${timestamp}`,
          letter: basicLetters[randomIndex],
          position: new Animated.ValueXY({ x: 0, y: 0 }),
          originalPosition: { x: 0, y: 0 },
          inDropZone: false,
          used: false,
          isDragging: false,
        });
      }

      return letters.sort(() => Math.random() - 0.5);
    } catch (err) {
      console.log("Fallback letter generation failed:", err);
      return [];
    }
  };

  const positionLetters = () => {
    if (!letterPlaygroundLayout.width || letters.length === 0) return;

    const letterWidth = 40;
    const letterHeight = 40;
    const padding = 25;
    const containerWidth = letterPlaygroundLayout.width;
    const containerHeight = letterPlaygroundLayout.height || 210;
    const usableWidth = containerWidth - (padding * 2);
    const usableHeight = containerHeight - (padding * 2);
    const maxColumns = 5;
    const rows = Math.ceil(letters.length / maxColumns);
    const horizontalSpacing = usableWidth / maxColumns;
    const verticalSpacing = usableHeight / rows;

    const needsPositioning = !letters[0].hasBeenPositioned;
    const updatedLetters = [];

    letters.forEach((letter, index) => {
      if (needsPositioning) {
        const col = index % maxColumns;
        const row = Math.floor(index / maxColumns);
        const x = padding + (col * horizontalSpacing) + (horizontalSpacing / 2 - letterWidth / 2);
        const y = padding + (row * verticalSpacing) + (verticalSpacing / 2 - letterHeight / 2);
        const newPosition = { x, y };
        letter.position.setValue(newPosition);

        updatedLetters.push({
          ...letter,
          originalPosition: newPosition,
          hasBeenPositioned: true
        });
      } else {
        if (!letter.isDragging) {
          updatedLetters.push(letter);
        } else {
          updatedLetters.push({
            ...letter,
            hasBeenPositioned: true
          });
        }
      }
    });

    if (needsPositioning) {
      setLetters(updatedLetters);
    }
  };

  useEffect(() => {
    if (letterPlaygroundLayout.width && letters.length > 0) {
      positionLetters();
    }
  }, [letterPlaygroundLayout.width, letters.length]);

  const handleTouchBlank = (blank) => {
    if (!blank.filled || !blank.filledWithLetterId) return;

    const filledLetter = letters.find(l => l.id === blank.filledWithLetterId);

    if (filledLetter) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playSound('drop');

      const updatedBlanks = blanks.map(b =>
        b.id === blank.id ? { ...b, filled: false, filledWithLetterId: null } : b
      );
      setBlanks(updatedBlanks);

      const updatedLetters = letters.map(l =>
        l.id === filledLetter.id ?
          {
            ...l,
            used: false,
            inDropZone: false,
            isDragging: false
          } : l
      );
      setLetters(updatedLetters);

      Animated.spring(filledLetter.position, {
        toValue: filledLetter.originalPosition,
        friction: 5,
        useNativeDriver: false
      }).start();

      setDroppedLetters(prev => prev.filter(l => l.blankId !== blank.id));
    }
  };

  const createPanResponder = (letter) => {
    let isDragging = false;
    const DRAG_THRESHOLD = 10;
    let initialMoveX = 0;
    let initialMoveY = 0;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => !letter.used,
      onPanResponderGrant: (e, gestureState) => {
        isDragging = false;
        initialMoveX = gestureState.moveX;
        initialMoveY = gestureState.moveY;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        letter.position.setOffset({
          x: letter.position.x._value,
          y: letter.position.y._value
        });
        letter.position.setValue({ x: 0, y: 0 });

        const updatedLetters = letters.map(l =>
          l.id === letter.id ? { ...l, isDragging: true } : l
        );
        setLetters(updatedLetters);
      },
      onPanResponderMove: (e, gestureState) => {
        const dx = Math.abs(gestureState.moveX - initialMoveX);
        const dy = Math.abs(gestureState.moveY - initialMoveY);

        if (!isDragging && (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD)) {
          isDragging = true;
        }

        letter.position.x.setValue(gestureState.dx);
        letter.position.y.setValue(gestureState.dy);
      },
      onPanResponderRelease: (e, gesture) => {
        letter.position.flattenOffset();

        const updatedLetters = letters.map(l =>
          l.id === letter.id ? { ...l, isDragging: false } : l
        );
        setLetters(updatedLetters);

        let droppedOnBlank = false;
        if (isDragging) {
          droppedOnBlank = checkDropZone(letter, gesture);
        }

        if (!droppedOnBlank) {
          Animated.spring(letter.position, {
            toValue: letter.originalPosition,
            friction: 5,
            useNativeDriver: false
          }).start();

          if (isDragging && !isMuted) {
            playSound('wrong');
          }
        }
      }
    });
  };

  const checkDropZone = (letter, gesture) => {
    try {
      const emptyBlanks = blanks.filter(blank => !blank.filled);
      if (emptyBlanks.length === 0) {
        return false;
      }

      const dropX = gesture.moveX;
      const dropY = gesture.moveY;
      const screenHeight = Dimensions.get('window').height;
      const dropAreaTop = 250;
      const dropAreaBottom = screenHeight * 0.65;

      if (dropY >= dropAreaTop && dropY <= dropAreaBottom) {
        const screenWidth = Dimensions.get('window').width;
        const blankWidth = 35;
        const margin = 5;
        const totalBlanksWidth = blanks.length * (blankWidth + margin * 2);
        const startX = (screenWidth - totalBlanksWidth) / 2;

        let targetBlankIndex = -1;
        let closestDistance = Infinity;

        emptyBlanks.forEach((blank) => {
          const blankIndex = blanks.findIndex(b => b.id === blank.id);
          const blankCenterX = startX + (blankIndex * (blankWidth + margin * 2)) + (blankWidth / 2) + margin;
          const distance = Math.abs(dropX - blankCenterX);

          if (distance < closestDistance) {
            closestDistance = distance;
            targetBlankIndex = blankIndex;
          }
        });

        if (targetBlankIndex >= 0) {
          const targetBlank = blanks[targetBlankIndex];
          const updatedBlanks = blanks.map(b =>
            b.id === targetBlank.id ?
              { ...b, filled: true, filledWithLetterId: letter.id } :
              b
          );

          setDroppedLetters(prev => [
            ...prev,
            {
              letterId: letter.id,
              letter: letter.letter,
              blankId: targetBlank.id
            }
          ]);

          const updatedLetters = letters.map(l =>
            l.id === letter.id ?
              { ...l, used: true, inDropZone: true } :
              l
          );

          Animated.spring(letter.position, {
            toValue: letter.originalPosition,
            friction: 5,
            useNativeDriver: false
          }).start();

          setBlanks(updatedBlanks);
          setLetters(updatedLetters);

          playSound('drop');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

          const allFilled = updatedBlanks.every(blank => blank.filled);
          if (allFilled) {
            setTimeout(() => {
              checkAnswer();
            }, 500);
          }

          return true;
        }
      }
      return false;
    } catch (err) {
      console.log("Error in checkDropZone:", err);
      return false;
    }
  };

  const checkAnswer = () => {
    const wordLetters = currentWord.split('');
    const allFilled = blanks.length === wordLetters.length &&
      blanks.every(blank => blank.filled);

    if (!allFilled) {
      return;
    }

    const spelledWord = blanks.map(blank => {
      const filledLetter = letters.find(l => l.id === blank.filledWithLetterId);
      return filledLetter ? filledLetter.letter : '';
    }).join('');

    const normalizedSpelledWord = spelledWord.trim().toLowerCase();
    const normalizedTargetWord = currentWord.trim().toLowerCase();

    if (normalizedSpelledWord === normalizedTargetWord) {
      handleWordComplete();
    } else {
      playSound('wrong');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (wrongAnimation.current) {
        wrongAnimation.current.play();
      }

      resetWord();
    }
  };

  const resetWord = () => {
    const resetBlanks = blanks.map(blank => ({
      ...blank,
      filled: false,
      filledWithLetterId: null
    }));

    const usedLetterIds = blanks
      .filter(blank => blank.filled && blank.filledWithLetterId)
      .map(blank => blank.filledWithLetterId);

    const resetLetters = letters.map(letter => {
      if (letter.used || usedLetterIds.includes(letter.id)) {
        Animated.spring(letter.position, {
          toValue: letter.originalPosition,
          friction: 5,
          useNativeDriver: false
        }).start();

        return {
          ...letter,
          used: false,
          inDropZone: false,
          isDragging: false
        };
      }
      return letter;
    });

    setBlanks(resetBlanks);
    setLetters(resetLetters);
    setDroppedLetters([]);
  };

  const handleSubmitWord = () => {
    const allBlanks = blanks.length === currentWord.length;
    const allFilled = blanks.every(blank => blank.filled);

    if (!allBlanks) {
      Alert.alert("Error", "There seems to be a problem with the blanks. Please reset and try again.");
      return;
    }

    if (!allFilled) {
      Alert.alert("Incomplete", "Please fill all the blanks first.");
      return;
    }

    checkAnswer();
  };

  const handleWordComplete = () => {
    try {
      playSound('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (correctAnimation.current) {
        correctAnimation.current.play();
      }

      let wordScore = 0;
      if (hintsUsedForCurrentWord === 0) {
        wordScore = currentWord.length * 10;
      } else if (hintsUsedForCurrentWord < currentWord.length) {
        const hintPenalty = hintsUsedForCurrentWord / currentWord.length;
        wordScore = Math.floor(currentWord.length * 10 * (1 - hintPenalty));
      }

      setScore(prevScore => prevScore + wordScore);

      setTimeout(() => {
        setLetters([]);
        setBlanks([]);
        setDroppedLetters([]);
        setRevealedHint('');
        setBlankPositions({});

        setTimeout(() => {
          if (availableWords && availableWords.length > 0) {
            setupGame();
          } else {
            endGame();
          }
        }, 300);
      }, 1500);
    } catch (err) {
      console.log("Error in handleWordComplete:", err);
      setTimeout(() => {
        if (availableWords && availableWords.length > 0) {
          setupGame();
        } else {
          endGame();
        }
      }, 1000);
    }
  };

  const endGame = () => {
    setGameOver(true);
    playSound('complete');

    try {
      if (SOUNDS.background?.object) {
        SOUNDS.background.object.stopAsync();
      }
    } catch (error) {
      console.log('Error stopping background music:', error);
    }

    if (animation.current) {
      animation.current.play();
    }

    setTimeout(() => {
      setGameState('summary');
    }, 2000);
  };

  const handleQuit = () => {
    Alert.alert(
      "Quit Game",
      "Are you sure you want to quit? Your progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Quit",
          style: "destructive",
          onPress: () => {
            try {
              if (SOUNDS.background?.object) {
                SOUNDS.background.object.stopAsync();
              }
            } catch (error) {
              console.log('Error stopping background music:', error);
            } finally {
              setGameState('difficulty');
            }
          }
        }
      ]
    );
  };

  const handleSkipWord = () => {
    Alert.alert(
      "Skip Word",
      "Are you sure you want to skip this word? You won't earn points for it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip",
          onPress: () => {
            if (availableWords.length > 0) {
              setupGame();
            } else {
              endGame();
            }
          }
        }
      ]
    );
  };

  const handleHint = () => {
    try {
      setHintsUsedForCurrentWord(prev => prev + 1);
      const emptyBlanks = blanks.filter(blank => !blank.filled);

      if (emptyBlanks.length === 0) {
        return;
      }

      const firstEmptyBlank = emptyBlanks[0];
      const blankIndex = blanks.findIndex(b => b.id === firstEmptyBlank.id);
      const correctLetter = currentWord[blankIndex].toUpperCase();

      const matchingLetter = letters.find(l =>
        l.letter.toUpperCase() === correctLetter &&
        !l.used
      );

      if (matchingLetter) {
        const updatedBlanks = blanks.map(b =>
          b.id === firstEmptyBlank.id ? {
            ...b,
            filled: true,
            filledWithLetterId: matchingLetter.id
          } : b
        );

        setDroppedLetters(prev => [
          ...prev,
          {
            letterId: matchingLetter.id,
            letter: matchingLetter.letter,
            blankId: firstEmptyBlank.id
          }
        ]);

        setBlanks(updatedBlanks);

        const updatedLetters = letters.map(l =>
          l.id === matchingLetter.id
            ? { ...l, used: true, inDropZone: true }
            : l
        );

        setLetters(updatedLetters);

        if (!isMuted) {
          Speech.speak(`${correctLetter.toLowerCase()}`, {
            language: 'en',
            pitch: 1.0,
            rate: 0.75,
          });
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const allFilled = updatedBlanks.every(blank => blank.filled);
        if (allFilled) {
          setTimeout(() => {
            checkAnswer();
          }, 500);
        }
      }
    } catch (err) {
      console.log("Error in handleHint:", err);
    }
  };

  const handleSelectDifficulty = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setCurrentWordIndex(0);
    setScore(0);
    setProgress(0);
    setGameOver(false);
    setGameState('game');
  };

  const handlePlayAgain = () => {
    setCurrentWordIndex(0);
    setScore(0);
    setProgress(0);
    setGameOver(false);
    setGameState('game');
  };

  const renderSplashScreen = () => {
    return (
      <ImageBackground
        source={require('./assets/images/ocean-splashscreen.png')}
        style={styles.container}
      >
        <View style={styles.overlay}>

          <Animated.View style={styles.titleContainer}>
            <Text style={styles.title}>Ocean Spelling Game</Text>
          </Animated.View>
        </View>
      </ImageBackground>
    );
  };

  const renderDifficultyScreen = () => {
    return (
      <ImageBackground
        source={require('./assets/images/levelselection-bg.png')}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Select Difficulty</Text>

          <View style={styles.difficultyContainer}>
            <TouchableOpacity
              style={[styles.difficultyButton, styles.easyButton]}
              onPress={() => handleSelectDifficulty('easy')}
            >
              <Text style={styles.difficultyText}>Easy</Text>
              <Text style={styles.difficultyDescription}>Simple words</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.difficultyButton, styles.mediumButton]}
              onPress={() => handleSelectDifficulty('medium')}
            >
              <Text style={styles.difficultyText}>Medium</Text>
              <Text style={styles.difficultyDescription}>Moderate words</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.difficultyButton, styles.hardButton]}
              onPress={() => handleSelectDifficulty('hard')}
            >
              <Text style={styles.difficultyText}>Hard</Text>
              <Text style={styles.difficultyDescription}>Challenging words</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Games')}
          >
            <Text style={styles.backButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  };

  const renderGameScreen = () => {
    try {
      return (
        <ImageBackground
          source={require('./assets/images/ocean-gamebackground.png')}
          style={styles.container}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={handleQuit}>
              <MaterialIcons name="exit-to-app" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{score}</Text>
            </View>

            <TouchableOpacity style={styles.iconButton} onPress={toggleMute}>
              <FontAwesome name={isMuted ? "volume-off" : "volume-up"} size={22} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>

          <View style={styles.imageContainer}>
            {currentImage ? (
              <TouchableOpacity
                onPress={() => {
                  if (!isMuted) {
                    Speech.speak(currentWord, {
                      language: 'en',
                      pitch: 1.0,
                      rate: 0.75,
                    });
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                activeOpacity={0.8}
              >
                <Image
                  source={currentImage}
                  style={styles.wordImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>?</Text>
              </View>
            )}
          </View>

          <View style={styles.letterContainerOuter}>
            <View style={styles.letterContainerInner}>
              {blanks.map((blank, index) => {
                const fillingLetter = blank.filled ?
                  letters.find(l => l.id === blank.filledWithLetterId) : null;

                return (
                  <TouchableOpacity
                    key={blank.id}
                    style={[
                      styles.blankContainer,
                      blank.filled ? styles.filledBlank : {}
                    ]}
                    onPress={() => blank.filled ? handleTouchBlank(blank) : null}
                    activeOpacity={blank.filled ? 0.6 : 1}
                    onLayout={(event) => {
                      try {
                        const { width, height } = event.nativeEvent.layout;
                        setBlankPositions(prev => ({
                          ...prev,
                          [blank.id]: { width, height }
                        }));
                      } catch (e) {
                        console.log("Error in blank onLayout:", e);
                      }
                    }}
                  >
                    {blank.filled ? (
                      <Text style={styles.blankFilledText}>
                        {fillingLetter ? fillingLetter.letter.toUpperCase() : ''}
                      </Text>
                    ) : (
                      <Text style={styles.blankText}>_</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View
            style={styles.letterPlayground}
            onLayout={(event) => {
              const { x, y, width, height } = event.nativeEvent.layout;
              setLetterPlaygroundLayout({ x, y, width, height });
              if (letters.length > 0) {
                setTimeout(positionLetters, 50);
              }
            }}
          >
            {letters.map((letter) => {
              const panResponder = createPanResponder(letter);

              return (
                <Animated.View
                  key={letter.id}
                  style={[
                    styles.letter,
                    { transform: letter.position.getTranslateTransform() },
                    letter.used && styles.usedLetter,
                    letter.isDragging && styles.draggingLetter
                  ]}
                  {...panResponder.panHandlers}
                >
                  <Text style={styles.letterText}>{letter.letter.toLowerCase()}</Text>
                </Animated.View>
              );
            })}
          </View>

          <View style={styles.gameControlsContainer}>
            <TouchableOpacity
              style={[styles.controlButton, styles.hintButton]}
              onPress={handleHint}
            >
              <Text style={styles.controlButtonText}>Hint</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.resetButton]}
              onPress={resetWord}
            >
              <Text style={styles.controlButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.skipButton]}
              onPress={handleSkipWord}
            >
              <Text style={styles.controlButtonText}>Skip</Text>
            </TouchableOpacity>

            {showSubmitButton && (
              <TouchableOpacity
                style={[styles.controlButton, styles.submitButton]}
                onPress={handleSubmitWord}
              >
                <Text style={styles.controlButtonText}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>

          <LottieView
            ref={wrongAnimation}
            source={require('./assets/animations/incorrect.json')}
            style={styles.wrongAnimation}
            loop={false}
            speed={1.2}
          />
        </ImageBackground>
      );
    } catch (err) {
      console.log("Error rendering game screen:", err);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => setGameState('difficulty')}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderSummaryScreen = () => {
    return (
      <ImageBackground
        source={require('./assets/images/ocean-gamebackground.png')}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Game Complete!</Text>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Your Score:</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Difficulty:</Text>
              <Text style={styles.statValue}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>High Score:</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
          </View>

          <View style={styles.leaderboardContainer}>
            <Text style={styles.leaderboardTitle}>Leaderboard</Text>
            <View style={styles.leaderboardItem}>
              <Text style={styles.leaderboardRank}>1.</Text>
              <Text style={styles.leaderboardName}>You</Text>
              <Text style={styles.leaderboardScore}>{score}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.playAgainButton]}
              onPress={handlePlayAgain}
            >
              <Text style={styles.buttonText}>Play Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.menuButton]}
              onPress={() => setGameState('difficulty')}
            >
              <Text style={styles.buttonText}>Back to Menu</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Games')}
          >
            <Text style={styles.backButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  };

  const renderScreen = () => {
    switch (gameState) {
      case 'splash': return renderSplashScreen();
      case 'difficulty': return renderDifficultyScreen();
      case 'game': return renderGameScreen();
      case 'summary': return renderSummaryScreen();
      default: return renderSplashScreen();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderScreen()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginTop: 30,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 150, 199, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  scoreContainer: {
    backgroundColor: 'rgba(0, 150, 199, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
  },
  scoreText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'OpenDyslexic-Bold',
  },
  progressContainer: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    marginHorizontal: 20,
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00BCD4',
    borderRadius: 5,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    marginTop: 20,
  },
  wordImage: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  placeholderImage: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    color: 'white',
    fontFamily: 'OpenDyslexic-Bold',
  },
  blanksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    flexWrap: 'wrap',
  },
  blankSpace: {
    width: 40,
    height: 40,
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blankLine: {
    color: 'white',
    fontSize: 30,
    fontFamily: 'OpenDyslexic',
  },
  letter: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFDE7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#DDD5BE',
    touchAction: 'none',
  },
  draggingLetter: {
    zIndex: 1000,
    elevation: 25,
    shadowOpacity: 0.7,
    shadowRadius: 7,
    backgroundColor: '#FFFFE0',
    borderColor: '#FFD700',
  },
  usedLetter: {
    opacity: 0.8,
    backgroundColor: '#D4F5D4',
    borderColor: '#76C376',
  },
  gameOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  completeAnimation: {
    width: 300,
    height: 300,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'OpenDyslexic',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    fontFamily: 'OpenDyslexic-Bold',
  },
  subtitle: {
    fontSize: 24,
    color: '#00BCD4',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    fontFamily: 'OpenDyslexic',
  },
  titleContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyContainer: {
    width: '100%',
    alignItems: 'center',
  },
  difficultyButton: {
    width: '80%',
    height: 100,
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  easyButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  mediumButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.8)',
  },
  hardButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  difficultyIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  difficultyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'OpenDyslexic-Bold',
  },
  difficultyDescription: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    fontFamily: 'OpenDyslexic',
  },
  backButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'OpenDyslexic',
  },
  scoreLabel: {
    fontSize: 24,
    color: 'white',
    fontFamily: 'OpenDyslexic',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    fontFamily: 'OpenDyslexic-Bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'OpenDyslexic',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'OpenDyslexic-Bold',
  },
  leaderboardContainer: {
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 15,
    marginVertical: 20,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'OpenDyslexic-Bold',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  leaderboardRank: {
    width: '15%',
    fontSize: 16,
    color: 'white',
    fontFamily: 'OpenDyslexic',
  },
  leaderboardName: {
    width: '50%',
    fontSize: 16,
    color: 'white',
    fontFamily: 'OpenDyslexic',
  },
  leaderboardScore: {
    width: '35%',
    fontSize: 16,
    color: 'white',
    textAlign: 'right',
    fontFamily: 'OpenDyslexic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 130,
    alignItems: 'center',
  },
  playAgainButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    marginRight: 10,
  },
  menuButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'OpenDyslexic',
  },
  gameControlsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    zIndex: 20,
  },
  controlButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: 'rgba(0, 150, 199, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'OpenDyslexic',
  },
  hintButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  skipButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.8)',
  },
  submitButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
  },
  resetButton: {
    backgroundColor: 'rgba(233, 30, 99, 0.8)',
  },
  revealedHintContainer: {
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  revealedHintText: {
    color: 'white',
    fontSize: 24,
    letterSpacing: 8,
    fontFamily: 'OpenDyslexic-Bold',
  },
  letterContainerOuter: {
    width: '94%',
    marginHorizontal: '3%',
    backgroundColor: 'rgba(0, 79, 113, 0.6)',
    borderRadius: 15,
    padding: 15,
    paddingVertical: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    minHeight: 100,
    zIndex: 5,
  },
  letterContainerInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  blankContainer: {
    width: 35,
    height: 35,
    margin: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 150, 199, 0.3)',
  },
  blankText: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'OpenDyslexic',
  },
  blankFilledText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'OpenDyslexic-Bold',
  },
  filledBlank: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: 'rgba(76, 175, 80, 0.7)',
  },
  filledBlankOverlay: {
    width: '80%',
    height: '80%',
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  letterPlayground: {
    width: '94%',
    marginHorizontal: '3%',
    backgroundColor: 'rgba(0, 79, 113, 0.4)',
    borderRadius: 20,
    padding: 15,
    marginTop: 15,
    minHeight: 210,
    marginBottom: 80,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    aspectRatio: 1.8,
    alignSelf: 'center',
    overflow: 'visible',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
    fontFamily: 'OpenDyslexic',
  },
  wrongAnimation: {
    zIndex: 30,
    pointerEvents: 'none',
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'OpenDyslexic-Bold',
  },
  animation: {
    width: 200,
    height: 200,
  }
});

export default DSpellingGame;