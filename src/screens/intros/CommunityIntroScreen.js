import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatureIntroScreen from '../../components/FeatureIntroScreen';

// Use online images instead of Lottie animations
const communitySlides = [
  {
    id: '1',
    title: 'Join the Community',
    description: 'Connect with others who understand the dyslexia journey. Share experiences, ask questions, and find support.',
    imageUrl: 'https://img.freepik.com/free-vector/team-concept-illustration_114360-678.jpg',
    icon: 'users'
  },
  {
    id: '2',
    title: 'Share Your Story',
    description: 'Create posts, comment on others experiences, and build meaningful connections in a safe, supportive environment.',
    imageUrl: 'https://img.freepik.com/free-vector/conversation-concept-illustration_114360-1289.jpg',
    icon: 'comment-dots'
  },
  {
    id: '3',
    title: 'Stay Connected',
    description: 'Get notifications about comments, likes, and new posts from people you follow in the community.',
    imageUrl: 'https://img.freepik.com/free-vector/mobile-notification-concept-illustration_114360-4243.jpg',
    icon: 'bell'
  },
];

const CommunityIntroScreen = () => {
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
    navigation.navigate('Community');
  };

  return (
    <FeatureIntroScreen
      slides={communitySlides}
      featureKey="community"
      onComplete={handleComplete}
      colors={['#0066FF', '#4DA6FF']} // Blue theme matching community
    />
  );
};

export default CommunityIntroScreen;
