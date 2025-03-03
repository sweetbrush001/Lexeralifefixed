import AsyncStorage from '@react-native-async-storage/async-storage';

// Consistent key naming
const getFeatureKey = (feature) => `@feature_intro_${feature}`;
const NEW_USER_KEY = '@is_new_user';

/**
 * Check if a user has seen a specific feature intro
 */
export const hasSeenFeatureIntro = async (featureKey) => {
  try {
    const key = getFeatureKey(featureKey);
    const value = await AsyncStorage.getItem(key);
    console.log(`[FeatureIntro] Checking ${featureKey}: ${value === 'seen' ? 'SEEN' : 'NOT SEEN'}`);
    return value === 'seen';
  } catch (error) {
    console.error(`[FeatureIntro] Error checking if seen ${featureKey}:`, error);
    return false;
  }
};

/**
 * Mark a feature intro as seen
 */
export const markFeatureIntroAsSeen = async (featureKey) => {
  try {
    const key = getFeatureKey(featureKey);
    await AsyncStorage.setItem(key, 'seen');
    console.log(`[FeatureIntro] Marked ${featureKey} as SEEN`);
    return true;
  } catch (error) {
    console.error(`[FeatureIntro] Error marking ${featureKey} as seen:`, error);
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
    const keys = await AsyncStorage.getAllKeys();
    const introKeys = keys.filter(key => key.startsWith('@feature_intro_'));
    
    if (introKeys.length > 0) {
      await AsyncStorage.multiRemove(introKeys);
    }
    
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
 * Mark user as not new anymore
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
 * Debug function to dump all AsyncStorage values
 */
export const debugAsyncStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    console.log('===== AsyncStorage Debug =====');
    items.forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    console.log('=============================');
    return items;
  } catch (error) {
    console.error('Error debugging AsyncStorage:', error);
    return [];
  }
};

/**
 * Reset all feature intro flags (for testing)
 */
export const resetAllFeatureIntros = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const introKeys = keys.filter(key => key.startsWith('@feature_intro_'));
    if (introKeys.length > 0) {
      await AsyncStorage.multiRemove(introKeys);
      console.log(`[FeatureIntro] Reset ${introKeys.length} intro flags`);
    }
    return true;
  } catch (error) {
    console.error('[FeatureIntro] Error resetting feature intros:', error);
    return false;
  }
};
