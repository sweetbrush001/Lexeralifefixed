import React, { useEffect, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import FeatureIntroScreen from '../../components/FeatureIntroScreen';
import { markFeatureIntroAsSeen } from '../../utils/FeatureIntroUtils'; // Fixed import name

const relaxSlides = [
  {
    id: '1',
    title: 'Find Your Calm',
    description: 'Welcome to the Relax zone, your personal sanctuary for peace and mindfulness.',
    imageUrl: 'https://img.freepik.com/free-vector/meditation-concept-illustration_114360-2466.jpg',
    icon: 'spa'
  },
  {
    id: '2',
    title: 'Soothing Sounds',
    description: 'Discover a collection of calming audio tracks designed to help you relax, focus, or sleep better.',
    imageUrl: 'https://img.freepik.com/free-vector/equalizer-concept-illustration_114360-5442.jpg',
    icon: 'headphones'
  },
  {
    id: '3',
    title: 'Set Your Timer',
    description: 'Create the perfect relaxation session with customizable timers. Your audio will automatically stop when the time is up.',
    imageUrl: 'https://img.freepik.com/free-vector/schedule-management-concept-illustration_114360-1248.jpg',
    icon: 'clock'
  },
];

const RelaxIntroScreen = () => {
  const navigation = useNavigation();
  const featureKey = 'relax';

  // Mark feature as seen using the improved system
  const markFeatureAsSeen = useCallback(async () => {
    try {
      console.log(`[RelaxIntro] Marking ${featureKey} as seen`);
      await markFeatureIntroAsSeen(featureKey); // Fixed function name
    } catch (err) {
      console.error(`Error marking ${featureKey} intro as seen:`, err);
    }
  }, [featureKey]);

  // Handle navigation completion
  const handleComplete = useCallback(() => {
    console.log(`[RelaxIntro] Intro completed, navigating to Relax`);
    markFeatureAsSeen();
    navigation.navigate('Relax');
  }, [navigation, markFeatureAsSeen]);

  // Handle back button press
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          console.log(`[RelaxIntro] Back button pressed, marking as seen`);
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
      console.log(`[RelaxIntro] Screen unmounting, marking as seen`);
      markFeatureAsSeen();
    };
  }, [markFeatureAsSeen]);

  return (
    <FeatureIntroScreen
      slides={relaxSlides}
      featureKey={featureKey}
      onComplete={handleComplete}
      colors={['#FF9999', '#FF5E62']} // Pink/Red theme for relax
    />
  );
};

export default RelaxIntroScreen;
