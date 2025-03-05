import React, { useEffect, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import FeatureIntroScreen from '../../components/FeatureIntroScreen';
import { markFeatureIntroAsSeen } from '../../utils/FeatureIntroUtils';

const gameSlides = [
  {
    id: '1',
    title: 'Brain Training Games',
    description: 'Fun and engaging games designed specifically to strengthen cognitive skills related to reading and comprehension.',
    imageUrl: 'https://img.freepik.com/free-vector/game-development-concept-illustration_114360-4453.jpg',
    icon: 'brain'
  },
  {
    id: '2',
    title: 'Track Your Progress',
    description: 'See how your skills improve over time with detailed progress tracking and performance insights.',
    imageUrl: 'https://img.freepik.com/free-vector/business-analysis-concept-illustration_114360-1605.jpg',
    icon: 'chart-line'
  },
  {
    id: '3',
    title: 'Challenge Yourself',
    description: 'Multiple difficulty levels ensure the games remain challenging as your skills improve.',
    imageUrl: 'https://img.freepik.com/free-vector/levels-concept-illustration_114360-6454.jpg',
    icon: 'trophy'
  },
];

const GameIntroScreen = () => {
  const navigation = useNavigation();
  const featureKey = 'game';

  // Mark feature as seen using the improved system
  const markFeatureAsSeen = useCallback(async () => {
    try {
      console.log(`[GameIntro] Marking ${featureKey} as seen`);
      await markFeatureIntroAsSeen(featureKey);
    } catch (err) {
      console.error(`Error marking ${featureKey} intro as seen:`, err);
    }
  }, [featureKey]);

  // Handle navigation completion
  const handleComplete = useCallback(() => {
    console.log(`[GameIntro] Intro completed, navigating to Game`);
    markFeatureAsSeen();
    navigation.navigate('Game');
  }, [navigation, markFeatureAsSeen]);

  // Handle back button press
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          console.log(`[GameIntro] Back button pressed, marking as seen`);
          markFeatureAsSeen();
          navigation.navigate('Home');
          return true;
        }
      );

      return () => backHandler.remove();
    }, [navigation, markFeatureAsSeen])
  );

  // Mark as seen on unmount
  useEffect(() => {
    return () => {
      console.log(`[GameIntro] Screen unmounting, marking as seen`);
      markFeatureAsSeen();
    };
  }, [markFeatureAsSeen]);

  return (
    <FeatureIntroScreen
      slides={gameSlides}
      featureKey={featureKey}
      onComplete={handleComplete}
      colors={['#4CAF50', '#8BC34A']} // Green theme for games
    />
  );
};

export default GameIntroScreen;
