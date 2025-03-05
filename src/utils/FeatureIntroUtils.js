import AsyncStorage from '@react-native-async-storage/async-storage';

// Consistent key naming
const getFeatureKey = (feature) => `@feature_intro_${feature}`;
const NEW_USER_KEY = '@is_new_user';

/**
 * Safely marks a feature intro as seen in AsyncStorage
 * @param {string} featureKey - The key for the feature
 * @returns {Promise} - Promise resolving when complete
 */
export const markFeatureIntroAsSeen = async (featureKey) => {
  try {
    if (!featureKey) {
      console.warn('markFeatureIntroAsSeen called without a feature key');
      return;
    }
    
    const storageKey = getFeatureKey(featureKey);
    await AsyncStorage.setItem(storageKey, 'true');
    console.log(`Marked feature intro as seen: ${featureKey}`);
  } catch (error) {
    console.error(`Error marking feature intro as seen: ${error.message}`);
    // Don't throw, just log
  }
};

/**
 * Checks if a feature intro has been seen before
 * @param {string} featureKey - The key for the feature
 * @returns {Promise<boolean>} - Promise resolving to true if seen
 */
export const hasSeenFeatureIntro = async (featureKey) => {
  try {
    if (!featureKey) {
      console.warn('hasSeenFeatureIntro called without a feature key');
      return false;
    }
    
    const storageKey = getFeatureKey(featureKey);
    const value = await AsyncStorage.getItem(storageKey);
    return value === 'true';
  } catch (error) {
    console.error(`Error checking if feature intro seen: ${error.message}`);
    return false; // Default to not seen on error
  }
};

/**
 * Reset a specific feature intro so it will show again
 * @param {string} featureKey - The key for the feature to reset
 */
export const resetFeatureIntro = async (featureKey) => {
  try {
    if (!featureKey) {
      console.warn('resetFeatureIntro called without a feature key');
      return;
    }
    
    const storageKey = getFeatureKey(featureKey);
    await AsyncStorage.removeItem(storageKey);
    console.log(`Reset feature intro: ${featureKey}`);
    return true;
  } catch (error) {
    console.error(`Error resetting feature intro: ${error.message}`);
    return false;
  }
};

/**
 * Reset all feature intros so they will all show again
 */
export const resetAllFeatureIntros = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const introKeys = keys.filter(key => key.startsWith('@feature_intro_'));
    
    if (introKeys.length > 0) {
      await AsyncStorage.multiRemove(introKeys);
      console.log(`Reset ${introKeys.length} feature intros`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error resetting all feature intros: ${error.message}`);
    return false;
  }
};

/**
 * Mark user as new (such as after registration)
 */
export const markAsNewUser = async () => {
  try {
    await AsyncStorage.setItem(NEW_USER_KEY, 'true');
    
    // For new users, clear any previous intro flags
    await resetAllFeatureIntros();
    
    console.log('[FeatureIntro] User marked as NEW, all intro flags cleared');
    return true;
  } catch (error) {
    console.error('[FeatureIntro] Error marking user as new:', error);
    return false;
  }
};

/**
 * Check if this is a new user
 */
export const isNewUser = async () => {
  try {
    const value = await AsyncStorage.getItem(NEW_USER_KEY);
    console.log(`[FeatureIntro] User is ${value === 'true' ? 'NEW' : 'RETURNING'}`);
    return value === 'true';
  } catch (error) {
    console.error('[FeatureIntro] Error checking if user is new:', error);
    return false;
  }
};

/**
 * Mark user as not new anymore (completed onboarding)
 */
export const completeNewUserOnboarding = async () => {
  try {
    await AsyncStorage.setItem(NEW_USER_KEY, 'false');
    console.log('[FeatureIntro] User marked as RETURNING');
    return true;
  } catch (error) {
    console.error('[FeatureIntro] Error completing new user onboarding:', error);
    return false;
  }
};

/**
 * Debug function to dump all AsyncStorage values related to intros
 */
export const debugIntroStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const introKeys = keys.filter(key => 
      key.startsWith('@feature_intro_') || key === NEW_USER_KEY
    );
    
    if (introKeys.length === 0) {
      console.log('No intro-related keys found in AsyncStorage');
      return {};
    }
    
    const items = await AsyncStorage.multiGet(introKeys);
    const result = {};
    
    console.log('===== Feature Intro Storage =====');
    items.forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
      result[key] = value;
    });
    console.log('================================');
    
    return result;
  } catch (error) {
    console.error('Error debugging intro storage:', error);
    return {};
  }
};
