import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatureIntroScreen from '../../components/FeatureIntroScreen';

// Use online images instead of Lottie animations
const gameSlides = [
  {
    id: '1',
    title: 'Brain Training Games',
    description: 'Fun and engaging games designed specifically to strengthen cognitive skills related to reading and comprehension.',
    imageUrl: 'https://img.freepik.com/free-vector/mobile-game-concept-illustration_114360-2411.jpg',
    icon: 'brain'
  },
  {
    id: '2',
    title: 'Track Your Progress',
    description: 'See how your skills improve over time with detailed progress tracking and performance insights.',
    imageUrl: 'https://img.freepik.com/free-vector/dashboard-concept-illustration_114360-4932.jpg',
    icon: 'chart-line'
  },
  {
    id: '3',
    title: 'Challenge Yourself',
    description: 'Multiple difficulty levels ensure the games remain challenging as your skills improve.',
    imageUrl: 'https://img.freepik.com/free-vector/winner-concept-illustration_114360-1995.jpg',
    icon: 'trophy'
  },
];

const GameIntroScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('Home');
        return true;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleComplete = () => {
    navigation.navigate('Game');
  };

  return (
    <FeatureIntroScreen
      slides={gameSlides}
      featureKey="game"
      onComplete={handleComplete}
      colors={['#4CAF50', '#8BC34A']} // Green theme for brain training/games
    />
  );
};

export default GameIntroScreen;
