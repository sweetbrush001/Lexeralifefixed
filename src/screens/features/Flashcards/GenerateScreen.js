import React, { useState, useEffect } from "react";
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
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Flashcard from "../Flashcards/Flashcard";
import { generateFlashcards } from "../Flashcards/api";
import { saveFlashcards } from "../Flashcards/storage";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#7C4DFF", // Purple primary color
  primaryLight: "#B39DDB",
  secondary: "#FF9800", // Orange accent
  background: "#F5F7FA",
  card: "#FFFFFF",
  text: "#333333",
  textLight: "#78909C",
  border: "#E0E0E0",
  success: "#4CAF50",
  error: "#F44336",
  shadow: "#000",
};

const CATEGORIES = [
  { 
    label: "Technology", 
    value: "technology",
    icon: "laptop-outline",
    color: "#7C4DFF"
  },
  { 
    label: "Geography", 
    value: "geography",
    icon: "earth-outline",
    color: "#26A69A"
  },
  { 
    label: "History", 
    value: "history",
    icon: "time-outline",
    color: "#EF5350"
  },
  { 
    label: "Science", 
    value: "science",
    icon: "flask-outline",
    color: "#42A5F5"
  },
  { 
    label: "Other", 
    value: "other",
    icon: "apps-outline",
    color: "#FFA726"
  },
];

const FLASHCARD_COLORS = [
  "#FFFFFF", // White
  "#E3F2FD", // Light Blue
  "#F3E5F5", // Light Purple
  "#E8F5E9", // Light Green
  "#FFF8E1", // Light Yellow
  "#FFEBEE", // Light Red
];

export default function GenerateScreen({ setActiveTab, navigation }) {
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
  const [step, setStep] = useState(1); // 1: Input, 2: Results

  useEffect(() => {
    if (flashcards.length > 0) {
      setStep(2);
    }
  }, [flashcards]);

  const handleGenerate = async () => {
    if (!subtopic.trim()) {
      setError("Please enter a subtopic");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

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
        setLoading(false);
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
        `${allFlashcards.length} flashcards saved to "${subtopic}" collection!`,
        [
          {
            text: "View Collection",
            onPress: () => setActiveTab('saved'),
            style: "default",
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
              setStep(1);
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

  const renderInputScreen = () => (
    <View style={styles.inputScreen}>
      <Text style={styles.screenTitle}>Create Flashcards</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Select a category</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryItem,
                { backgroundColor: cat.color + '20' }, // 20% opacity
                category === cat.value && { 
                  backgroundColor: cat.color + '30',
                  borderColor: cat.color,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setCategory(cat.value)}
            >
              <Ionicons 
                name={cat.icon} 
                size={24} 
                color={cat.color} 
                style={styles.categoryIcon} 
              />
              <Text
                style={[
                  styles.categoryText,
                  { color: cat.color },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter a subtopic</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="book-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={subtopic}
            onChangeText={setSubtopic}
            placeholder="e.g., JavaScript Promises"
            placeholderTextColor={COLORS.textLight}
            accessibilityLabel="Enter a subtopic"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter your questions (optional)</Text>
        <View style={styles.textareaWrapper}>
          <TextInput
            style={styles.textarea}
            value={userQuestions}
            onChangeText={setUserQuestions}
            placeholder="Enter questions separated by commas or new lines"
            placeholderTextColor={COLORS.textLight}
            multiline={true}
            textAlignVertical="top"
            accessibilityLabel="Enter your questions"
          />
        </View>
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
          <View style={styles.buttonContent}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.buttonText}>Generating...</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="flash-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Generate Flashcards</Text>
          </View>
        )}
      </TouchableOpacity>

      {error ? (
        <View style={styles.messageContainer}>
          <Ionicons name="alert-circle-outline" size={20} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );

  const renderResultsScreen = () => (
    <View style={styles.resultsScreen}>
      <View style={styles.resultsHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setStep(1)}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.collectionTitle}>{subtopic}</Text>
        <Text style={styles.flashcardCount}>{flashcards.length} flashcards</Text>
      </View>

      {flashcards.map((flashcard, index) => (
        <View 
          key={flashcard.id || index} 
          style={[
            styles.flashcardWrapper, 
            { backgroundColor: flashcard.color }
          ]}
        >
          <Flashcard flashcard={flashcard} />
        </View>
      ))}

      {!showNewFlashcardFields && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowNewFlashcardFields(true)}
        >
          <Ionicons name="add-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Add Custom Flashcard</Text>
        </TouchableOpacity>
      )}

      {showNewFlashcardFields && (
        <View style={styles.newFlashcardsContainer}>
          <Text style={styles.sectionTitle}>Custom Flashcards</Text>
          
          {newFlashcards.map((flashcard, index) => (
            <View key={index} style={styles.newFlashcard}>
              <View style={styles.inputWrapper}>
                <Ionicons name="help-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={flashcard.question}
                  onChangeText={(text) => handleNewFlashcardChange(index, "question", text)}
                  placeholder="Question"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
              
              <View style={[styles.inputWrapper, { marginTop: 10 }]}>
                <Ionicons name="chatbubble-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={flashcard.answer}
                  onChangeText={(text) => handleNewFlashcardChange(index, "answer", text)}
                  placeholder="Answer"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
              
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFlashcard(index)}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          {newFlashcards.length < 3 && (
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={handleAddFlashcard}
            >
              <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.addMoreButtonText}>Add Another Flashcard</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Ionicons name="save-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Save Collection</Text>
      </TouchableOpacity>

      {successMessage ? (
        <View style={styles.messageContainer}>
          <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 ? renderInputScreen() : renderResultsScreen()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputScreen: {
    width: "100%",
  },
  resultsScreen: {
    width: "100%",
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: COLORS.text,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoryItem: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    width: 120,
    height: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryIcon: {
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  textareaWrapper: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    height: 56,
  },
  textarea: {
    width: "100%",
    height: 120,
    fontSize: 16,
    color: COLORS.text,
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.card,
  },
  errorText: {
    color: COLORS.error,
    marginLeft: 8,
    fontSize: 14,
  },
  successText: {
    color: COLORS.success,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  resultsHeader: {
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  collectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 8,
  },
  flashcardCount: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
    marginTop: 24,
  },
  flashcardWrapper: {
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButton: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  newFlashcardsContainer: {
    marginTop: 16,
  },
  newFlashcard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  removeButton: {
    backgroundColor: COLORS.error,
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    alignSelf: "flex-end",
    width: 100,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    marginTop: 8,
  },
  addMoreButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});