"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  View,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const cardWidth = width - 40; // 20px padding on each side

const COLORS = {
  primary: "#7C4DFF", // Purple primary color to match GenerateScreen
  primaryLight: "#B39DDB",
  secondary: "#FF9800", // Orange accent
  background: "#F5F7FA",
  card: "#FFFFFF",
  text: "#333333",
  textLight: "#78909C",
  border: "#E0E0E0",
  hint: "#9E9E9E",
  success: "#4CAF50",
};

export default function Flashcard({ flashcard, expanded }) {
  const [flipped, setFlipped] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Start pulse animation when component mounts
  useEffect(() => {
    startPulseAnimation();
  }, []);
  
  // Pulse animation for the hint text
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Interpolate rotation for front and back of the card
  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  // Scale animation for card when flipping
  const scaleInterpolate = animatedValue.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [1, 0.95, 1],
  });

  // Apply rotation and scale to front and back of the card
  const frontAnimatedStyle = {
    transform: [
      { rotateY: frontInterpolate },
      { scale: scaleInterpolate }
    ],
  };

  const backAnimatedStyle = {
    transform: [
      { rotateY: backInterpolate },
      { scale: scaleInterpolate }
    ],
  };

  // Flip the card animation
  const flipCard = () => {
    Animated.spring(animatedValue, {
      toValue: flipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  // Get gradient colors based on flashcard color
  const getGradientColors = (baseColor) => {
    // If the color is white or very light, use a subtle gradient
    if (baseColor === "#FFFFFF" || baseColor === "#E3F2FD") {
      return ["#F8F9FA", "#E9ECEF"];
    }
    
    // For colored cards, create a gradient effect
    const lightenColor = (color) => {
      // Simple function to lighten the color for gradient effect
      return color + "90"; // Add 90 for 56% opacity
    };
    
    return [baseColor, lightenColor(baseColor)];
  };

  // Get icon based on category
  const getCategoryIcon = () => {
    const category = flashcard.category || "other";
    
    switch(category.toLowerCase()) {
      case "technology":
        return "laptop-outline";
      case "geography":
        return "earth-outline";
      case "history":
        return "time-outline";
      case "science":
        return "flask-outline";
      default:
        return "apps-outline";
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.95} 
      onPress={flipCard} 
      style={styles.container}
    >
      {/* Front of the card (Question) */}
      <Animated.View
        style={[
          styles.card,
          frontAnimatedStyle,
          { zIndex: flipped ? 0 : 1 },
        ]}
      >
        <LinearGradient
          colors={getGradientColors(flashcard.color)}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Question</Text>
            <View style={styles.categoryBadge}>
              <Ionicons name={getCategoryIcon()} size={14} color={COLORS.primary} />
              <Text style={styles.categoryText}>
                {flashcard.category || "General"}
              </Text>
            </View>
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={styles.cardContentBold}>{flashcard.question}</Text>
          </View>
          
          <View style={styles.cardFooter}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={styles.hintContainer}>
                <Ionicons name="sync-outline" size={14} color={COLORS.hint} />
                <Text style={styles.tapHint}>Tap to flip</Text>
              </View>
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Back of the card (Answer) */}
      <Animated.View
        style={[
          styles.card,
          backAnimatedStyle,
          { zIndex: flipped ? 1 : 0 },
        ]}
      >
        <LinearGradient
          colors={getGradientColors(flashcard.color)}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: COLORS.success }]}>Answer</Text>
            <View style={styles.categoryBadge}>
              <Ionicons name={getCategoryIcon()} size={14} color={COLORS.primary} />
              <Text style={styles.categoryText}>
                {flashcard.category || "General"}
              </Text>
            </View>
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={styles.cardContent}>{flashcard.answer}</Text>
          </View>
          
          <View style={styles.cardFooter}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={styles.hintContainer}>
                <Ionicons name="sync-outline" size={14} color={COLORS.hint} />
                <Text style={styles.tapHint}>Tap to flip</Text>
              </View>
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: 220,
    position: "relative",
    marginVertical: 8,
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    position: "absolute",
    backfaceVisibility: "hidden", // Hide the back of the card when flipped
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  cardContentBold: {
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 26,
    fontWeight: "700",
    textAlign: "center",
  },
  cardContent: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: "center",
  },
  cardFooter: {
    alignItems: "center",
    marginTop: 16,
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tapHint: {
    fontSize: 12,
    color: COLORS.hint,
    marginLeft: 4,
    fontWeight: "500",
  },
});