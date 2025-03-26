import React, { useEffect, useState, useMemo } from "react"; // Import React and hooks for state, effects, and memoization
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Animated
} from "react-native"; // Import React Native components for UI
import { useNavigation } from "@react-navigation/native"; // Import navigation hook for screen transitions
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"; // Import icon sets
import { auth, db } from "../../../config/firebaseConfig"; // Import Firebase configuration
import { collection, addDoc } from "firebase/firestore"; // Import Firestore functions for database operations
import { useTextStyle } from '../../../hooks/useTextStyle'; // Import custom text styling hook
import * as Haptics from 'expo-haptics'; // Import haptic feedback capabilities
import { LinearGradient } from 'expo-linear-gradient'; // Import gradient component for UI elements

/**
 * ResultsScreen Component
 * Displays and saves test results with dynamic feedback based on score
 * 
 * @param {Object} route - Route object containing test answers
 * @returns {JSX.Element} Rendered ResultsScreen component
 */
const ResultsScreen = ({ route }) => {
  // Extract test answers from navigation params
  const { answers } = route.params;
  const navigation = useNavigation();
  const user = auth.currentUser; // Get current authenticated user
  
  // State variables
  const [isSaving, setIsSaving] = useState(true); // Track saving state for database operations
  const [showDetails, setShowDetails] = useState(false); // Toggle for showing detailed test answers
  const rawTextStyle = useTextStyle(); // Get text style from global settings
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0]; // Animation for fading in elements
  const slideAnim = useState(new Animated.Value(50))[0]; // Animation for sliding in elements
  const pulseAnim = useState(new Animated.Value(1))[0]; // Animation for pulsing percentage circle

  /**
   * Create optimized text styles for different UI components
   * Extracts font family from global settings while preserving specific style attributes
   */
  const textStyle = useMemo(() => {
    // Use only font family from settings, preserve other styles
    const { fontFamily } = rawTextStyle;
    return { fontFamily };
  }, [rawTextStyle]);

  // Style for headings that need to maintain specific sizes
  const headingStyle = useMemo(() => ({
    ...textStyle,
  }), [textStyle]);

  // Style for content text that can accommodate font changes
  const contentStyle = useMemo(() => ({
    ...textStyle,
  }), [textStyle]);

  // Style for percentage text which needs to maintain its impact
  const percentageStyle = useMemo(() => ({
    ...textStyle,
  }), [textStyle]);

  // Style for buttons to ensure they remain readable
  const buttonTextStyle = useMemo(() => ({
    ...textStyle,
    color: "#fff", // Ensure button text remains white for contrast
  }), [textStyle]);

  // Create a special style for the details button text that doesn't force white color
  const detailsButtonTextStyle = useMemo(() => {
    // Only take the font family from settings, not the color
    const { fontFamily } = textStyle;
    return { fontFamily };
  }, [textStyle]);

  /**
   * Set up animations when component mounts
   * Includes fade-in, slide-up, and pulsing effects
   */
  useEffect(() => {
    // Animate in the content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // Set up pulsing animation for percentage
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /**
   * Calculate test results based on user answers
   * Returns percentage score, result text, and detailed explanation
   * 
   * @returns {Object} Object containing result metrics
   */
  const getResult = () => {
    // Calculate how many 'yes' answers were given
    const yesAnswers = answers.filter((answer) => answer === true).length;
    // Calculate percentage score
    const percentage = ((yesAnswers / answers.length) * 100).toFixed(0);

    let resultText = "";
    let detailedText = "";
    
    // Determine result category and detailed explanation based on percentage
    if (percentage >= 75) {
      resultText = "High likelihood of dyslexia";
      detailedText = "Your responses strongly indicate signs of dyslexia. We recommend consulting with a specialized educational psychologist or a dyslexia specialist for a comprehensive assessment.";
    } else if (percentage >= 50) {
      resultText = "Moderate likelihood of dyslexia";
      detailedText = "Your responses show some indicators of dyslexia. Consider seeking a professional evaluation to understand your learning profile better.";
    } else if (percentage >= 25) {
      resultText = "Low likelihood of dyslexia";
      detailedText = "Your responses show few indicators of dyslexia, but if you're experiencing reading or learning difficulties, consulting with an educational specialist could still be beneficial.";
    } else {
      resultText = "Minimal likelihood of dyslexia";
      detailedText = "Your responses suggest minimal indicators of dyslexia. If you're still concerned about learning difficulties, consider discussing with an education professional.";
    }

    return { 
      text: resultText, 
      detailedText: detailedText,
      percentage 
    };
  };

  // Extract result data from the getResult function
  const { text: resultText, detailedText, percentage } = getResult();

  /**
   * Determine color scheme based on percentage score
   * Returns colors for UI elements that reflect risk level
   * 
   * @param {string} percentage - Score percentage
   * @returns {Object} Object containing color values
   */
  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return { main: "#FF453A", gradient: ["#FF5252", "#FF1744"] }; // Red for high
    if (percentage >= 50) return { main: "#FF9F0A", gradient: ["#FFB74D", "#FF9800"] }; // Orange for medium-high
    if (percentage >= 25) return { main: "#FFD60A", gradient: ["#FFEE58", "#FDD835"] }; // Yellow for medium-low
    return { main: "#34C759", gradient: ["#4CAF50", "#2E7D32"] }; // Green for low
  };

  // Get color scheme based on result percentage
  const colorScheme = getPercentageColor(percentage);

  /**
   * Save test result to Firebase when component mounts
   * Creates a document in the testResults collection
   */
  useEffect(() => {
    const saveResultToFirebase = async () => {
      // Ensure user is logged in before saving
      if (!user) {
        Alert.alert("Error", "You must be logged in to save results.");
        setIsSaving(false);
        return;
      }

      try {
        // Add new document to testResults collection
        await addDoc(collection(db, "testResults"), {
          userId: user.uid,
          percentage: parseInt(percentage),
          resultCategory: resultText,
          answers: answers,
          timestamp: new Date(),
        });
        
        // Give haptic feedback on successful save
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
      } catch (error) {
        console.error("Error saving result:", error);
        Alert.alert("Error", "Failed to save result.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setIsSaving(false);
    };

    saveResultToFirebase();
  }, []);

  /**
   * Render recommendation section based on test results
   * Only shows for scores above 50%
   * 
   * @returns {JSX.Element|null} Recommendations section or null
   */
  const renderRecommendations = () => {
    if (parseInt(percentage) >= 50) {
      return (
        <View style={styles.recommendationsContainer}>
          <Text style={[styles.recommendationsTitle, headingStyle]}>What to do next:</Text>
          <View style={styles.recommendationItem}>
            <FontAwesome5 name="user-md" size={20} color={colorScheme.main} />
            <Text style={[styles.recommendationText, contentStyle]}>Consult with an educational psychologist</Text>
          </View>
          <View style={styles.recommendationItem}>
            <FontAwesome5 name="book-reader" size={20} color={colorScheme.main} />
            <Text style={[styles.recommendationText, contentStyle]}>Explore assistive reading technologies</Text>
          </View>
          <View style={styles.recommendationItem}>
            <FontAwesome5 name="brain" size={20} color={colorScheme.main} />
            <Text style={[styles.recommendationText, contentStyle]}>Learn more about dyslexia management strategies</Text>
          </View>
        </View>
      );
    }
    return null;
  };

  /**
   * Toggle display of detailed test answers
   * Provides haptic feedback for interaction
   */
  const toggleDetails = () => {
    setShowDetails(!showDetails);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  /**
   * Navigate back to home screen
   * Provides haptic feedback for interaction
   */
  const handleGoHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("Home");
  };

  /**
   * Navigate to previous results screen
   * Provides haptic feedback for interaction
   */
  const handleViewPreviousResults = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("PreviousResults");
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <Animated.View 
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.card}>
          {/* Background gradient for card */}
          <LinearGradient
            colors={['#6C63FF20', '#FFFFFF']}
            style={styles.cardGradient}
          />
          <Text style={[styles.title, headingStyle]}>Your Results</Text>

          {/* Percentage indicator with dynamic coloring */}
          <View style={styles.percentageContainer}>
            <Animated.View 
              style={[
                styles.percentageCircleOuter,
                { 
                  borderColor: colorScheme.main,
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <LinearGradient
                colors={[colorScheme.gradient[0] + '30', colorScheme.gradient[1] + '10']}
                style={styles.percentageCircleInner}
              >
                <Text style={[styles.percentageText, { color: colorScheme.main }, percentageStyle]}>{percentage}%</Text>
              </LinearGradient>
            </Animated.View>
            
            {/* Result category badge */}
            <View style={styles.resultCategoryContainer}>
              <LinearGradient
                colors={colorScheme.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.resultCategoryBadge}
              >
                <Text style={[styles.resultCategory, headingStyle]}>{resultText}</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Detailed explanation text */}
          <Text style={[styles.resultText, contentStyle]}>{detailedText}</Text>

          {/* Conditional recommendations section */}
          {renderRecommendations()}

          {/* Toggle button for detailed test answers */}
          <TouchableOpacity 
            style={[styles.detailsButton, showDetails && styles.detailsButtonActive]}
            onPress={toggleDetails}
          >
            <Text 
              style={[
                styles.detailsButtonText, 
                showDetails && styles.detailsButtonTextActive,
                detailsButtonTextStyle
              ]}
            >
              {showDetails ? "Hide Test Details" : "Show Test Details"}
            </Text>
            <Ionicons 
              name={showDetails ? "chevron-up" : "chevron-down"} 
              size={24} 
              color={showDetails ? "#FFFFFF" : "#FF8500"}
            />
          </TouchableOpacity>

          {/* Detailed test answers - conditionally rendered */}
          {showDetails && (
            <View style={styles.answersContainer}>
              <Text style={[styles.answersTitle, headingStyle]}>Your Responses:</Text>
              {answers.map((answer, index) => (
                <View key={index} style={styles.answerRow}>
                  <LinearGradient
                    colors={answer ? ['#4CAF50', '#2E7D32'] : ['#FF5252', '#FF1744']}
                    style={styles.answerIcon}
                  >
                    <Ionicons 
                      name={answer ? "checkmark" : "close"} 
                      size={16} 
                      color="#FFFFFF" 
                    />
                  </LinearGradient>
                  <Text style={[styles.answerText, contentStyle]}>
                    Question {index + 1}: {answer ? "Yes" : "No"}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Loading indicator while saving results */}
          {isSaving ? (
            <View style={styles.savingContainer}>
              <ActivityIndicator size="large" color="#6C63FF" />
              <Text style={[styles.savingText, contentStyle]}>Saving your results...</Text>
            </View>
          ) : (
            // Navigation buttons once saved
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.buttonWrapper, styles.historyButtonWrapper]} 
                onPress={handleViewPreviousResults}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF9F0A', '#FF8500']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <Ionicons name="time-outline" size={24} color="#fff" />
                  <Text style={[styles.buttonText, buttonTextStyle]}>View History</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.buttonWrapper, styles.homeButtonWrapper]} 
                onPress={handleGoHome}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF9F0A', '#FF8500']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <Ionicons name="home" size={24} color="#fff" />
                  <Text style={[styles.buttonText, buttonTextStyle]}>Home</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Disclaimer message */}
          <View style={styles.disclaimerContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={[styles.disclaimerText, contentStyle]}>
              This screening tool provides an indication only and is not a clinical diagnosis.
            </Text>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

// Get device width for responsive design
const { width } = Dimensions.get('window');

// StyleSheet for component styling
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    width: "100%",
  },
  card: { 
    width: "100%", 
    maxWidth: 500, 
    padding: 24, 
    backgroundColor: "#FFFFFF", 
    borderRadius: 28, 
    elevation: 10, 
    shadowColor: "#6C63FF", 
    shadowOffset: { width: 0, height: 12 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  title: { 
    fontSize: 32, 
    fontWeight: "700", 
    textAlign: "center", 
    marginBottom: 28, 
    color: "#1A1A1A",
  },
  percentageContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  percentageCircleOuter: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    borderWidth: 6, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  percentageCircleInner: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: { 
    fontSize: 40, 
    fontWeight: "700",
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  resultCategoryContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  resultCategoryBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  resultCategory: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  resultText: { 
    fontSize: 18, 
    textAlign: "center", 
    marginVertical: 28, 
    color: "#4A4A4A", 
    lineHeight: 26 
  },
  recommendationsContainer: {
    backgroundColor: "#F5F7FF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E0E6FF",
    flexShrink: 1,  // Allow container to shrink if needed
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",  // Changed from center to flex-start for better text alignment
    marginBottom: 14,
  },
  recommendationText: {
    fontSize: 16,
    marginLeft: 14,
    color: "#333",
    flex: 1,
    flexWrap: 'wrap',  // Allow text to wrap
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,  // Add horizontal padding
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#FF8500", // Updated border color to match the orange theme
    borderRadius: 16,
    backgroundColor: "transparent",
    minHeight: 52,  // Set minimum height
  },
  detailsButtonActive: {
    backgroundColor: '#FF8500',
    borderColor: "#6C63FF",
  },
  detailsButtonText: {
    fontSize: 16,
    color: "#FF8500", // Changed from "#6C63FF" to orange to match other elements
    marginRight: 8,
    fontWeight: "600",
  },
  detailsButtonTextActive: {
    color: "#FFFFFF",
  },
  answersContainer: {
    backgroundColor: "#F5F7FF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E0E6FF",
  },
  answersTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  answerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  answerText: {
    fontSize: 16,
    marginLeft: 14,
    color: "#333",
  },
  savingContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  savingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: width > 400 ? "row" : "column",
    justifyContent: "space-between",
    marginTop: 20,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: width > 400 ? 8 : 0,
    marginVertical: width > 400 ? 0 : 8,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  historyButtonWrapper: {
    shadowColor: "#FF9800", // Changed to orange
  },
  homeButtonWrapper: {
    shadowColor: "#FF9800", // Changed to orange
  },
  button: { 
    paddingVertical: 16, 
    borderRadius: 20, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",
    backgroundColor: "#FF9800", // Added orange background color
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "600", 
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  disclaimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E6FF",
  },
  disclaimerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
});

export default ResultsScreen;