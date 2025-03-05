import React, { useEffect, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import FeatureIntroScreen from '../../components/FeatureIntroScreen';
import { markFeatureIntroAsSeen } from '../../utils/FeatureIntroUtils';

const testIntroSlides = [
  {
    id: '1',
    title: 'Dyslexia Screening',
    description: 'Welcome to our comprehensive dyslexia screening tool, designed to help identify potential reading difficulties.',
    imageUrl: 'https://img.freepik.com/free-vector/brain-concept-illustration_114360-1932.jpg',
    icon: 'book-reader'
  },
  {
    id: '2',
    title: 'Personalized Assessment',
    description: 'Our test adapts to your responses and provides a detailed analysis of your reading patterns.',
    imageUrl: 'https://img.freepik.com/free-vector/checklist-concept-illustration_114360-479.jpg',
    icon: 'clipboard-check'
  },
  {
    id: '3',
    title: 'Track Your Progress',
    description: 'Take the test multiple times to track your improvement over time. View your results history anytime.',
    imageUrl: 'https://img.freepik.com/free-vector/progress-concept-illustration_114360-1421.jpg',
    icon: 'chart-line'
  },
];

const TestIntroScreen = () => {
  const navigation = useNavigation();
  const featureKey = 'test';
  
  // Fix function call
  const markFeatureAsSeen = useCallback(async () => {
    try {
      console.log(`[TestIntro] Marking ${featureKey} as seen`);
      await markFeatureIntroAsSeen(featureKey); // Fixed function name
    } catch (err) {
      console.error(`Error marking ${featureKey} intro as seen:`, err);
    }
  }, [featureKey]);

  // Handle navigation completion
  const handleComplete = useCallback(() => {
    console.log(`[TestIntro] Intro completed, navigating to Test`);
    markFeatureAsSeen();
    navigation.navigate('Teststarting');
  }, [navigation, markFeatureAsSeen]);

  // Handle back button press
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          console.log(`[TestIntro] Back button pressed, marking as seen`);
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
      console.log(`[TestIntro] Screen unmounting, marking as seen`);
      markFeatureAsSeen();
    };
  }, [markFeatureAsSeen]);

  return (
    <FeatureIntroScreen
      slides={testIntroSlides}
      featureKey={featureKey}
      onComplete={handleComplete}
      colors={['#4158D0', '#C850C0']} // Purple/blue gradient for test
    />
  );
};

export default TestIntroScreen;
