import React from "react"; // Import React for component creation
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from "react-native"; // Import basic React Native components
import { useNavigation } from "@react-navigation/native"; // Import navigation hook for screen transitions
import { LinearGradient } from "expo-linear-gradient"; // Import for creating gradient backgrounds
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the back button

// Get device width for responsive design
const { width } = Dimensions.get("window");

/**
 * TestIntroScreen Component
 * Landing screen for the dyslexia test feature with options to start test or view results
 * 
 * @returns {JSX.Element} Rendered TestIntroScreen component
 */
const TestIntroScreen = () => {
  // Get navigation object for screen transitions
  const navigation = useNavigation();

  /**
   * Renders a card with gradient background for test options
   * 
   * @param {string} title - The title of the card
   * @param {string} description - Descriptive text for the card option
   * @param {Function} onPress - Function to execute when card is pressed
   * @param {string[]} gradientColors - Array of colors for gradient background
   * @returns {JSX.Element} Card component with specified properties
   */
  const renderCard = (title, description, onPress, gradientColors) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button to return to home screen */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Header section with title and subtitle */}
      <View style={styles.header}>
        <Text style={styles.title}>Dyslexia{'\n'}Screening</Text>
        <Text style={styles.subtitle}>
          Choose an option below to begin your screening journey
        </Text>
      </View>

      {/* Container for option cards */}
      <View style={styles.cardsContainer}>
        {/* Card to start a new test */}
        {renderCard(
          "Start New Test",
          "Begin a comprehensive dyslexia screening assessment",
          () => navigation.navigate("Test"),
          ["#4158D0", "#C850C0"]
        )}

        {/* Card to view previous test results */}
        {renderCard(
          "View Results",
          "Access and analyze your previous screening results",
          () => navigation.navigate("PreviousResults"),
          ["#0093E9", "#80D0C7"]
        )}
      </View>
    </SafeAreaView>
  );
};

/**
 * StyleSheet for component styling
 * Includes styles for layout, cards, typography, and visual elements
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 70,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 10,
    letterSpacing: -0.5,
    textAlign: "center",
    position: "relative",
    marginTop: 50,
   
  },
  subtitle: {
    fontSize: 26,
    color: "#666666",
    lineHeight: 24,
    letterSpacing: 0.1,
    textAlign: "center",
    marginTop: 10,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: "center",
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 24,
    borderRadius: 16,
    minHeight: 140,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
});

export default TestIntroScreen;