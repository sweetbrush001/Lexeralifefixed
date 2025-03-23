import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Flashcard from "./Flashcard";
import { generateFlashcards } from "./api";
import { saveFlashcards } from "./storage";

const COLORS = {
  primary: "#6200ee",
  background: "#f8f8f8",
  card: "#ffffff",
  text: "#333333",
  border: "#e0e0e0",
  success: "#4caf50",
  error: "#f44336",
};

const CATEGORIES = [
  { label: "Technology", value: "technology" },
  { label: "Geography", value: "geography" },
  { label: "History", value: "history" },
  { label: "Science", value: "science" },
  { label: "Other", value: "other" },
];

const FLASHCARD_COLORS = [
  "#ffffff", "#96ADFC", "#DB1F1F", "#B987DC", "#A8F29A", "#F8FD89"
];

export default function GenerateScreen({ setActiveTab }) {
  const [category, setCategory] = useState("technology");
  const [subtopic, setSubtopic] = useState("");
  const [userQuestions, setUserQuestions] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedColor, setSelectedColor] = useState(FLASHCARD_COLORS[0]);
  const [newFlashcards, setNewFlashcards] = useState([]);
  const [showNewFlashcardFields, setShowNewFlashcardFields] = useState(false);

  const handleGenerate = async () => {
    if (!subtopic.trim()) {
      setError("Please enter a subtopic");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    setFlashcards([]);

    try {
      const questionsArray = userQuestions
        .split(/[\n,]/)
        .map((q) => q.trim())
        .filter((q) => q.length > 0);

      const generatedFlashcards = await generateFlashcards(
        category,
        subtopic.trim(),
        questionsArray.length > 0 ? questionsArray : undefined
      );

      if (!generatedFlashcards || generatedFlashcards.length === 0) {
        setError("No flashcards were generated. Please try again.");
        return;
      }

      // Add category, subtopic, and flashcard color to each flashcard
      const flashcardsWithMetadata = generatedFlashcards.map(card => ({
        ...card,
        category: category,
        subtopic: subtopic.trim(),
        color: selectedColor,
        createdAt: new Date().toISOString()
      }));

      setFlashcards(flashcardsWithMetadata);
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes("429")) {
        setError("API rate limit exceeded. Please try again later.");
      } else {
        setError("Failed to generate flashcards. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!flashcards.length && !newFlashcards.length) return;

    const validNewFlashcards = newFlashcards.filter(
      (flashcard) => flashcard.question.trim() && flashcard.answer.trim()
    );

    const flashcardsWithMetadata = validNewFlashcards.map(card => ({
      ...card,
      category: category,
      subtopic: subtopic.trim(),
      color: selectedColor,
      createdAt: new Date().toISOString()
    }));

    const allFlashcards = [...flashcards, ...flashcardsWithMetadata];

    try {
      await saveFlashcards(allFlashcards);
      setSuccessMessage("Flashcards saved to collection!");

      Alert.alert(
        "Success",
        `Flashcards saved to "${subtopic}" collection!`,
        [
          {
            text: "View Collection",
            onPress: () => setActiveTab('saved'),
          },
          {
            text: "Create More",
            onPress: () => {
              setFlashcards([]);
              setSubtopic("");
              setUserQuestions("");
              setSuccessMessage("");
              setNewFlashcards([]);
              setShowNewFlashcardFields(false);
            },
          },
        ]
      );
    } catch (err) {
      setError("Failed to save flashcards");
      console.error(err);
    }
  };

  const handleAddFlashcard = () => {
    if (newFlashcards.length < 3) {
      setNewFlashcards([...newFlashcards, { question: "", answer: "" }]);
    }
  };

  const handleRemoveFlashcard = (index) => {
    const updatedFlashcards = newFlashcards.filter((_, i) => i !== index);
    setNewFlashcards(updatedFlashcards);
  };

  const handleNewFlashcardChange = (index, field, value) => {
    const updatedFlashcards = newFlashcards.map((flashcard, i) =>
      i === index ? { ...flashcard, [field]: value } : flashcard
    );
    setNewFlashcards(updatedFlashcards);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Select a category</Text>
          <View style={styles.picker}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.pickerItem,
                  category === cat.value && styles.pickerItemSelected,
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    category === cat.value && styles.pickerItemTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter a subtopic</Text>
          <TextInput
            style={styles.input}
            value={subtopic}
            onChangeText={setSubtopic}
            placeholder="e.g., JavaScript Promises"
            placeholderTextColor="#999"
            accessibilityLabel="Enter a subtopic"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter your questions (optional)</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            value={userQuestions}
            onChangeText={setUserQuestions}
            placeholder="Enter questions separated by commas or new lines"
            placeholderTextColor="#999"
            multiline={true}
            accessibilityLabel="Enter your questions"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Select a flashcard color</Text>
          <View style={styles.colorPicker}>
            {FLASHCARD_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.generateButton, loading && styles.disabledButton]}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={[styles.buttonText, { marginLeft: 8 }]}>Generating...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Generate Flashcards</Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

        {flashcards.length > 0 && (
          <View style={styles.resultContainer}>
            <Text style={styles.collectionTitle}>{subtopic} Collection</Text>
            {flashcards.map((flashcard) => (
              <View key={flashcard.id} style={[styles.flashcardWrapper, { backgroundColor: flashcard.color }]}>
                <Flashcard flashcard={flashcard} />
              </View>
            ))}
          </View>
        )}

        {flashcards.length > 0 && !showNewFlashcardFields && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowNewFlashcardFields(true)}
          >
            <Text style={styles.buttonText}>Add Flashcard</Text>
          </TouchableOpacity>
        )}

        {showNewFlashcardFields && (
          <View style={styles.newFlashcardsContainer}>
            {newFlashcards.map((flashcard, index) => (
              <View key={index} style={styles.newFlashcard}>
                <TextInput
                  style={styles.input}
                  value={flashcard.question}
                  onChangeText={(text) => handleNewFlashcardChange(index, "question", text)}
                  placeholder="Question"
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={[styles.input, { marginTop: 10 }]}
                  value={flashcard.answer}
                  onChangeText={(text) => handleNewFlashcardChange(index, "answer", text)}
                  placeholder="Answer"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveFlashcard(index)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
            {newFlashcards.length < 3 && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddFlashcard}
              >
                <Text style={styles.buttonText}>Add Another Flashcard</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {(flashcards.length > 0 || newFlashcards.length > 0) && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Save Collection</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: COLORS.text,
  },
  picker: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  pickerItem: {
    paddingVertical: 10,
  },
  pickerItemSelected: {
    backgroundColor: COLORS.primary,
  },
  pickerItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  pickerItemTextSelected: {
    color: "#fff",
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: COLORS.primary,
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButton: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 15,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    marginTop: 20,
  },
  collectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  flashcardWrapper: {
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: 15,
    textAlign: "center",
  },
  successText: {
    color: COLORS.success,
    marginBottom: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  newFlashcardsContainer: {
    marginTop: 20,
  },
  newFlashcard: {
    marginBottom: 20,
  },
  removeButton: {
    backgroundColor: COLORS.error,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});