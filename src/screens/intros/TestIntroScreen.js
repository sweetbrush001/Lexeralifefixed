import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// Fix the import path for FeatureIntroScreen
import FeatureIntroScreen from '../../components/FeatureIntroScreen';
import { markFeatureIntroAsSeenInFirebase } from '../../utils/userFirebaseUtils';

// Use online images instead of Lottie animations
const testIntroSlides = [
  {
    id: '1',
    title: 'Dyslexia Screening',
    description: 'Welcome to our comprehensive dyslexia screening tool, designed to help identify potential reading difficulties.',
    imageUrl: 'https://img.freepik.com/free-vector/creative-brain-concept-illustration_114360-1324.jpg',
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
    imageUrl: 'https://img.freepik.com/free-vector/growth-statistics-concept-illustration_114360-5495.jpg',
    icon: 'chart-line'
  },
];

const TestIntroScreen = () => {
  const navigation = useNavigation();
  
  // Mark feature as seen when completed
  const handleComplete = () => {
    console.log('[TestIntro] Intro completed, navigating to Test screen');
    
    // Mark this intro as seen in Firebase
    markFeatureIntroAsSeenInFirebase('test')
      .catch(err => console.error('Error marking test intro as seen:', err));
    
    // Navigate to the test screen
    navigation.navigate('Teststarting');
  };

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        console.log('[TestIntro] Back button pressed, marking as seen');
        
        markFeatureIntroAsSeenInFirebase('test')
          .catch(err => console.error('Error marking test intro as seen:', err));
        
        navigation.navigate('Home');
        return true;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Mark as seen on unmount
  useEffect(() => {
    return () => {
      console.log('[TestIntro] Screen unmounting, marking as seen');
      
      markFeatureIntroAsSeenInFirebase('test')
        .catch(err => console.error('Error marking test intro as seen on unmount:', err));
    };
  }, []);

  return (
    <FeatureIntroScreen
      slides={testIntroSlides}
      featureKey="test"
      onComplete={handleComplete}
      colors={['#4158D0', '#C850C0']} // Purple/blue gradient for test
    />
  );
};

export default TestIntroScreen;
