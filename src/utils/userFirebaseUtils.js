import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebaseConfig';

/**
 * Check if a user is considered a new user in Firebase
 * @returns {Promise<boolean>} True if new user, false otherwise
 */
export const isNewUserInFirebase = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('No user is signed in to check new user status');
      return false;
    }
    
    // Get user document from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    // If user doc doesn't exist or isNew is explicitly true, they're new
    if (!userDoc.exists() || userDoc.data().isNewUser === true) {
      console.log('User is marked as NEW in Firebase');
      return true;
    }
    
    console.log('User is marked as EXISTING in Firebase');
    return false;
  } catch (error) {
    console.error('Error checking if user is new in Firebase:', error);
    return false; // Default to false on error
  }
};

/**
 * Mark user as not new in Firebase
 */
export const markUserAsExistingInFirebase = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('No user is signed in to update new user status');
      return;
    }
    
    // Reference to user document
    const userDocRef = doc(db, 'users', user.uid);
    
    // Check if document exists
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      // If doc exists, update it
      await updateDoc(userDocRef, {
        isNewUser: false,
        lastUpdated: new Date()
      });
    } else {
      // If doc doesn't exist, create it
      await setDoc(userDocRef, {
        isNewUser: false,
        email: user.email,
        lastUpdated: new Date()
      });
    }
    
    console.log('User marked as existing in Firebase');
  } catch (error) {
    console.error('Error marking user as existing in Firebase:', error);
  }
};

/**
 * Check if user has seen specific feature intro in Firebase
 * @param {string} featureKey - The feature key to check
 * @returns {Promise<boolean>} - Whether the feature intro has been seen
 */
export const hasUserSeenFeatureIntroInFirebase = async (featureKey) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('No user is signed in to check feature intro status');
      return false;
    }
    
    // Get user document
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    // Check if feature has been seen
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const seenIntros = userData.seenIntros || {};
      
      console.log(`Checking if ${featureKey} intro seen: ${seenIntros[featureKey] === true}`);
      return seenIntros[featureKey] === true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error checking if user has seen ${featureKey} intro:`, error);
    return false;
  }
};

/**
 * Mark a specific feature intro as seen in Firebase
 * @param {string} featureKey - The feature key to mark as seen
 */
export const markFeatureIntroAsSeenInFirebase = async (featureKey) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('No user is signed in to mark feature intro as seen');
      return;
    }
    
    // Reference to user document
    const userDocRef = doc(db, 'users', user.uid);
    
    // Check if document exists
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      // Get existing seen intros
      const userData = docSnap.data();
      const seenIntros = userData.seenIntros || {};
      
      // Update with new feature
      seenIntros[featureKey] = true;
      
      // Update document
      await updateDoc(userDocRef, {
        seenIntros,
        lastUpdated: new Date()
      });
    } else {
      // Create new document
      const seenIntros = {
        [featureKey]: true
      };
      
      await setDoc(userDocRef, {
        isNewUser: false, // When they've seen an intro, they're no longer new
        email: user.email,
        seenIntros,
        lastUpdated: new Date()
      });
    }
    
    console.log(`Marked ${featureKey} intro as seen in Firebase`);
  } catch (error) {
    console.error(`Error marking ${featureKey} intro as seen:`, error);
  }
};
