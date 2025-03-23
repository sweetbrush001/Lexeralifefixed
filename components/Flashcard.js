"use client"; //hiiii

import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const cardWidth = width - 40; // 20px padding on each side

const COLORS = {
  primary: "#6200ee",
  text: "#333333",
  border: "#e0e0e0",
  hint: "#999999",
};

export default function Flashcard({ flashcard }) {
  const [flipped, setFlipped] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  // Interpolate rotation for front and back of the card
  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  // Apply rotation to front and back of the card
  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
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

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={flipCard} style={styles.container}>
      {/* Front of the card (Question) */}
      <Animated.View
        style={[
          styles.card,
          frontAnimatedStyle,
          { backgroundColor: flashcard.color },
          { zIndex: flipped ? 0 : 1 }, // Ensure the correct card is on top
        ]}
      >
        <Text style={styles.cardTitle}>Question</Text>
        <Text style={styles.cardContentBold}>{flashcard.question}</Text>
        <Text style={styles.tapHint}>Tap to see answer</Text>
      </Animated.View>

      {/* Back of the card (Answer) */}
      <Animated.View
        style={[
          styles.card,
          backAnimatedStyle,
          { backgroundColor: flashcard.color },
          { zIndex: flipped ? 1 : 0 }, // Ensure the correct card is on top
        ]}
      >
        <Text style={styles.cardTitle}>Answer</Text>
        <Text style={styles.cardContent}>{flashcard.answer}</Text>
        <Text style={styles.tapHint}>Tap to see question</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: 200,
    position: "relative",
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    padding: 20,
    position: "absolute",
    backfaceVisibility: "hidden", // Hide the back of the card when flipped
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: COLORS.primary,
    textAlign: "center", // Center title text
  },
  cardContentBold: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    fontWeight: "bold",
    textAlign: "center", // Center content text
  },
  cardContent: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: "center", // Center content text
  },
  tapHint: {
    fontSize: 12,
    color: COLORS.hint,
    textAlign: "center",
    marginTop: 10,
  },
});