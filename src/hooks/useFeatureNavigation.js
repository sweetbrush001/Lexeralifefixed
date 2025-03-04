import { useCallback } from 'react';
import { hasUserSeenFeatureIntroInFirebase } from '../utils/userFirebaseUtils';

export default function useFeatureNavigation(navigation, isNewUser) {
  const handleFeatureNavigation = useCallback(async (featureKey, introRoute, featureRoute) => {
    console.log(`Attempting to navigate to feature: ${featureKey}`);
    
    // For global new users, always show intros
    if (isNewUser) {
      console.log(`New user navigating to ${introRoute}`);
      navigation.navigate(introRoute);
      return;
    }
    
    try {
      // For returning users, check if they've seen this specific intro
      const hasSeenIntro = await hasUserSeenFeatureIntroInFirebase(featureKey);
      
      if (hasSeenIntro) {
        console.log(`User has seen ${featureKey} intro, going directly to ${featureRoute}`);
        navigation.navigate(featureRoute);
      } else {
        console.log(`User hasn't seen ${featureKey} intro yet, showing ${introRoute}`);
        navigation.navigate(introRoute);
      }
    } catch (error) {
      console.error(`Error in feature navigation for ${featureKey}:`, error);
      // On error, default to showing the feature
      navigation.navigate(featureRoute);
    }
  }, [navigation, isNewUser]);
  
  return handleFeatureNavigation;
}
