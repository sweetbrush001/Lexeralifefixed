import AsyncStorage from '@react-native-async-storage/async-storage';

// Track if the user is new (coming from registration)
export const markUserJourneyStatus = async (isNew = false) => {
  try {
    await AsyncStorage.setItem('@user_journey_status', isNew ? 'new' : 'returning');
    -
    // If new user, also initialize other flags
    if (isNew) {
      await AsyncStorage.setItem('@user_onboarded', 'false');
      
      // Reset any previously seen feature intros
      const keys = await AsyncStorage.getAllKeys();
      const introKeys = keys.filter(key => key.startsWith('@feature_intro_'));
      if (introKeys.length > 0) {
        await AsyncStorage.multiRemove(introKeys);
      }
    }
  } catch (error) {
    console.error('Error marking user journey status:', error);
  }
};

// Check if user is new
export const isNewUserJourney = async () => {
  try {
    const value = await AsyncStorage.getItem('@user_journey_status');
    return value === 'new';
  } catch (error) {
    console.error('Error checking user journey status:', error);
    return false;
  }
};

// Complete the new user journey
export const completeNewUserJourney = async () => {
  try {
    await AsyncStorage.setItem('@user_journey_status', 'returning');
    await AsyncStorage.setItem('@user_onboarded', 'true');
  } catch (error) {
    console.error('Error completing new user journey:', error);
  }
};
