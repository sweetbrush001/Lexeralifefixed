import AsyncStorage from '@react-native-async-storage/async-storage';

const FLASHCARDS_KEY = 'flashcards';

// Save flashcards to storage
export const saveFlashcards = async (newFlashcards) => {
  try {
    if (!newFlashcards || !Array.isArray(newFlashcards)) {
      throw new Error('Invalid flashcards data');
    }

    const existingFlashcards = await getSavedFlashcards();
    const combinedFlashcards = [...existingFlashcards, ...newFlashcards];

    await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(combinedFlashcards));
  } catch (error) {
    console.error('Error saving flashcards:', error);
  }
};

// Get saved flashcards from storage
export const getSavedFlashcards = async () => {
  try {
    const savedFlashcards = await AsyncStorage.getItem(FLASHCARDS_KEY);
    return savedFlashcards ? JSON.parse(savedFlashcards) : [];
  } catch (error) {
    console.error('Error loading flashcards:', error);
    return [];
  }
};

// Remove a flashcard by ID
export const removeFlashcard = async (id) => {
  try {
    const savedFlashcards = await getSavedFlashcards();
    const updatedFlashcards = savedFlashcards.filter((card) => card.id !== id);
    await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(updatedFlashcards));
  } catch (error) {
    console.error('Error removing flashcard:', error);
  }
};

// Clear all flashcards from storage
export const clearFlashcards = async () => {
  try {
    await AsyncStorage.removeItem(FLASHCARDS_KEY);
  } catch (error) {
    console.error('Error clearing flashcards:', error);
  }
};