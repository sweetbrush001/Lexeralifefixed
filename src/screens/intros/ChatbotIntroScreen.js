import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatureIntroScreen from '../../components/FeatureIntroScreen';
import { markFeatureIntroAsSeen } from '../../utils/FeatureIntroUtils';

// Use image URLs that are reliable
const chatbotSlides = [
  {
    id: '1',
    title: 'Meet Lexera Bot',
    description: 'Your personal AI assistant designed specifically to help with dyslexia-friendly conversations.',
    imageUrl: 'https://img.freepik.com/free-vector/chat-bot-concept-illustration_114360-5522.jpg',
    icon: 'robot'
  },
  {
    id: '2',
    title: 'Voice Conversations',
    description: 'Speak naturally with Lexera Bot! The voice recognition feature makes communication easier.',
    imageUrl: 'https://img.freepik.com/free-vector/voice-technologies-concept-illustration_114360-7811.jpg',
    icon: 'microphone'
  },
  {
    id: '3',
    title: 'Get Answers & Support',
    description: 'Ask questions about dyslexia, get reading tips, or just chat for emotional support whenever you need it.',
    imageUrl: 'https://img.freepik.com/free-vector/faq-concept-illustration_114360-5585.jpg',
    icon: 'question-circle'
  },
];

const ChatbotIntroScreen = () => {
  const navigation = useNavigation();

  // FIXED: Handle back button to properly mark feature as seen
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        console.log('[ChatbotIntro] Back button pressed, marking as seen');
        
        // Use the enhanced function that updates both local and Firebase
        markFeatureIntroAsSeen('chatbot');
        
        // Navigate with a slight delay to ensure state is updated
        setTimeout(() => {
          navigation.navigate('Home');
        }, 100);
        
        return true;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  // FIXED: When user completes intro
  const handleComplete = () => {
    console.log('[ChatbotIntro] Intro completed, navigating to Chatbot');
    
    // Our enhanced function now handles marking both local and Firebase
    navigation.navigate('Chatbot');
  };

  // FIXED: Also mark as seen on unmount
  useEffect(() => {
    return () => {
      console.log('[ChatbotIntro] Screen unmounting, marking as seen');
      markFeatureIntroAsSeen('chatbot');
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
