import React, { useEffect, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import FeatureIntroScreen from '../../components/FeatureIntroScreen';
import { markFeatureIntroAsSeen } from '../../utils/FeatureIntroUtils';

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
  const featureKey = 'community';

  // Mark feature as seen using the improved system
  const markFeatureAsSeen = useCallback(async () => {
    try {
      console.log(`[CommunityIntro] Marking ${featureKey} as seen`);
      await markFeatureIntroAsSeen(featureKey);
    } catch (err) {
      console.error(`Error marking ${featureKey} intro as seen:`, err);
    }
  }, [featureKey]);

  // Handle navigation completion
  const handleComplete = useCallback(() => {
    console.log(`[CommunityIntro] Intro completed, navigating to Community`);
    markFeatureAsSeen();
    navigation.navigate('Community');
  }, [navigation, markFeatureAsSeen]);

  // Handle back button press
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          console.log(`[CommunityIntro] Back button pressed, marking as seen`);
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
      console.log(`[CommunityIntro] Screen unmounting, marking as seen`);
      markFeatureAsSeen();
    };
  }, [markFeatureAsSeen]);

  return (
    <FeatureIntroScreen
      slides={communitySlides}
      featureKey={featureKey}
      onComplete={handleComplete}
      colors={['#0066FF', '#4DA6FF']} // Blue theme matching community
    />
  );
};

export default CommunityIntroScreen;
