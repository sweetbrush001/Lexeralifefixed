import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// Fix the import path for FeatureIntroScreen
import FeatureIntroScreen from '../../components/FeatureIntroScreen';
import { markFeatureIntroAsSeenInFirebase } from '../../utils/userFirebaseUtils';

// Use online images instead of Lottie animations
const chatbotSlides = [
  {
    id: '1',
    title: 'Meet Lexera Bot',
    description: 'Your personal AI assistant designed specifically to help with dyslexia-friendly conversations.',
    imageUrl: 'https://img.freepik.com/free-vector/cute-robot-waving-hand-cartoon-vector-icon-illustration-science-technology-icon-concept_138676-4565.jpg',
    icon: 'robot'
  },
  {
    id: '2',
    title: 'Voice Conversations',
    description: 'Speak naturally with Lexera Bot! The voice recognition feature makes communication easier.',
    imageUrl: 'https://img.freepik.com/free-vector/speech-recognition-abstract-concept-illustration_335657-3854.jpg',
    icon: 'microphone'
  },
  {
    id: '3',
    title: 'Get Answers & Support',
    description: 'Ask questions about dyslexia, get reading tips, or just chat for emotional support whenever you need it.',
    imageUrl: 'https://img.freepik.com/free-vector/organic-flat-customer-support-illustration_23-2148899173.jpg',
    icon: 'question-circle'
  },
];

const ChatbotIntroScreen = () => {
  const navigation = useNavigation();

  // Handle back button to properly mark feature as seen
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        console.log('[ChatbotIntro] Back button pressed, marking as seen');
        
        markFeatureIntroAsSeenInFirebase('chatbot')
          .catch(err => console.error('Error marking chatbot intro as seen:', err));
        
        navigation.navigate('Home');
        return true;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  // When user completes intro
  const handleComplete = () => {
    console.log('[ChatbotIntro] Intro completed, navigating to Chatbot');
    
    // Mark this intro as seen in Firebase
    markFeatureIntroAsSeenInFirebase('chatbot')
      .catch(err => console.error('Error marking chatbot intro as seen:', err));
    
    navigation.navigate('Chatbot');
  };

  // Also mark as seen on unmount
  useEffect(() => {
    return () => {
      console.log('[ChatbotIntro] Screen unmounting, marking as seen');
      
      markFeatureIntroAsSeenInFirebase('chatbot')
        .catch(err => console.error('Error marking chatbot intro as seen on unmount:', err));
    };
  }, []);

  return (
    <FeatureIntroScreen
      slides={chatbotSlides}
      featureKey="chatbot"
      onComplete={handleComplete}
      colors={['#A990FF', '#6B66FF']} // Purple theme matching chatbot
    />
  );
};

export default ChatbotIntroScreen;
