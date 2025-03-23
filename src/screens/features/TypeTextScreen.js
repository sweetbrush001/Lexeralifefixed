import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as Speech from "expo-speech";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";

const TypeTextScreen = () => {
  const navigation = useNavigation();
  const [typedText, setTypedText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

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
      setIsSpeaking(true);
      Speech.speak(typedText, {
        onDone: () => {
          setIsSpeaking(false);
        },
      });
    } else {
      alert("Please enter text to read aloud.");
    }
  };

  const stopReading = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  return (
    <LinearGradient colors={["#ff9a9e", "#fad0c4"]} style={styles.container}>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={32} color="#fff" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.header}>Type Your Text</Text>
        
        <View style={styles.inputContainer}>
          <ScrollView>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Enter text here..."
              value={typedText}
              onChangeText={setTypedText}
              placeholderTextColor="#999"
            />
          </ScrollView>
        </View>
        
        <View style={styles.buttonContainer}>
          {/* Read Text Button */}
          <TouchableOpacity
            onPress={speakTypedText}
            style={[styles.actionButton, isSpeaking ? styles.disabledButton : null]}
            disabled={isSpeaking}
          >
            <LinearGradient colors={["#ff9966", "#ff5e62"]} style={styles.actionButtonInner}>
              <Text style={styles.buttonText}>🔊 Read Text</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Stop Reading Button */}
          <TouchableOpacity
            onPress={stopReading}
            style={[styles.actionButton, !isSpeaking ? styles.disabledButton : null]} 
            disabled={!isSpeaking} 
          >
            <LinearGradient colors={["#ff5e62", "#d9534f"]} style={styles.actionButtonInner}>
              <Text style={styles.buttonText}>⏹️ Stop</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
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
  card: {
    width: '95%',
    borderRadius: 25,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#ff5e62",
  },
  inputContainer: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 250, 250, 0.8)',
    shadowColor: "#FF7043",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 25,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: "#333",
    textAlignVertical: 'top',
    minHeight: 250,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },  
  actionButton: {
    width: '48%',
    borderRadius: 15,
    shadowColor: "#ff9a9e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  actionButtonInner: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default TypeTextScreen;
