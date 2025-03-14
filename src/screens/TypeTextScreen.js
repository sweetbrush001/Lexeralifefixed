import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as Speech from "expo-speech";
import { LinearGradient } from "expo-linear-gradient";

const TypeTextScreen = () => {
  const navigation = useNavigation();
  const [typedText, setTypedText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false); // State to track speaking status

  // Stop speech when navigating away
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        Speech.stop();
        setIsSpeaking(false);
      };
    }, [])
  );

  const speakTypedText = () => {
    if (typedText.trim()) {
      setIsSpeaking(true); // Disable the button when speech starts
      Speech.speak(typedText, {
        onDone: () => {
          setIsSpeaking(false); // Enable the button after speech is done
        },
      });
    } else {
      alert("Please enter text to read aloud.");
    }
  };

  return (
    <LinearGradient colors={["#ff9a9e", "#fad0c4"]} style={styles.container}>
      <Text style={styles.header}>Type Your Text</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Enter text here..."
        value={typedText}
        onChangeText={setTypedText}
      />
      <TouchableOpacity
        onPress={speakTypedText}
        style={[styles.glowButton, isSpeaking ? styles.disabledButton : null]} // Disable the button while speaking
        disabled={isSpeaking} // Disable the button during speech
      >
        <LinearGradient colors={["#ff9966", "#ff5e62"]} style={styles.buttonInner}>
          <Text style={styles.buttonText}>🔊 Read Typed Text</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#fff",
  },
  input: {
    width: "90%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#FF7043",
    borderRadius: 20,
    marginVertical: 10,
    backgroundColor: "rgba(255, 250, 250, 0.8)",
    fontSize: 16,
    color: "#333",
  },
  glowButton: {
    width: "90%",
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  disabledButton: {
    opacity: 0.5, // Make the button semi-transparent when disabled
  },
  buttonInner: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TypeTextScreen;
