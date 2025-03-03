import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Speech from "expo-speech";
import { LinearGradient } from "expo-linear-gradient";

const TypeTextScreen = () => {
  const navigation = useNavigation();
  const [typedText, setTypedText] = useState("");

  const speakTypedText = () => {
    if (typedText.trim()) {
      Speech.speak(typedText);
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
      <TouchableOpacity onPress={speakTypedText} style={styles.glowButton}>
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
