import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Check if a user has seen the intro for a specific feature
 * @param {string} featureKey - The unique key for the feature
 * @returns {Promise<boolean>} - True if the user has seen the intro, false otherwise
 */
export const hasUserSeenIntro = async (featureKey) => {
  try {
    const key = `@feature_intro_${featureKey}`;
    const value = await AsyncStorage.getItem(key);
    return value === 'seen';
  } catch (error) {
    console.error('Error checking if user has seen intro:', error);
    return false;
  }
};

/**
 * Mark a feature intro as seen
 * @param {string} featureKey - The unique key for the feature
 */
export const markIntroAsSeen = async (featureKey) => {
  try {
    const key = `@feature_intro_${featureKey}`;
    await AsyncStorage.setItem(key, 'seen');
  } catch (error) {
    console.error('Error marking intro as seen:', error);
  }
};

/**
 * Mark user as onboarded (completed main app onboarding)
 */
export const markUserAsOnboarded = async () => {
  try {
    await AsyncStorage.setItem('@user_onboarded', 'true');
  } catch (error) {
    console.error('Error marking user as onboarded:', error);
  }
};

/**
 * Check if a user has completed the main app onboarding
 * @returns {Promise<boolean>} - True if the user has completed onboarding
 */
export const isUserOnboarded = async () => {
  try {
    const value = await AsyncStorage.getItem('@user_onboarded');
    return value === 'true';
  } catch (error) {
    console.error('Error checking if user is onboarded:', error);
    return false;
  }
};

/**
 * Reset all intro states (for testing)
 */
export const resetAllIntros = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const introKeys = keys.filter(key => 
      key.startsWith('@feature_intro_') || key === '@user_onboarded'
    );
    await AsyncStorage.multiRemove(introKeys);
  } catch (error) {
    console.error('Error resetting intros:', error);
  }
};
