import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView, StatusBar, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Font from "expo-font";

// Import screens
import HomeScreen from "./screens/HomeScreen";
import GameScreen from "./screens/GameScreen";
import ScoreboardScreen from "./screens/ScoreboardScreen";
import { AppProvider } from "./context/AppContext";
import { SoundProvider } from "./context/SoundContext"; // Import SoundProvider

const Stack = createNativeStackNavigator();

// Utility function to shuffle an array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Load custom fonts
    async function loadFonts() {
      await Font.loadAsync({
        OpenDyslexic: require("./assets/fonts/OpenDyslexic-Regular.otf"),
        "OpenDyslexic-Bold": require("./assets/fonts/OpenDyslexic-Bold.otf"),
      });
      setFontsLoaded(true);
    }

    // Initialize word lists in AsyncStorage if they don't exist
    async function initializeWordLists() {
      try {
        const easyWords = await AsyncStorage.getItem("easyWords");
        const mediumWords = await AsyncStorage.getItem("mediumWords");
        const hardWords = await AsyncStorage.getItem("hardWords");

        if (!easyWords) {
          const defaultEasyWords = [
            "cat", "dog", "sun", "hat", "run", "big", "red", "box", "cup", "pen", "map", "sit", "top", "bus", "jam",
          ];
          await AsyncStorage.setItem("easyWords", JSON.stringify(defaultEasyWords));
        }

        if (!mediumWords) {
          const defaultMediumWords = [
            "apple", "house", "table", "chair", "water", "paper", "music", "happy", "plant", "light", "bread", "clock", "phone", "smile", "green",
          ];
          await AsyncStorage.setItem("mediumWords", JSON.stringify(defaultMediumWords));
        }

        if (!hardWords) {
          const defaultHardWords = [
            "banana", "garden", "window", "family", "school", "orange", "purple", "friend", "pencil", "summer", "winter", "animal", "planet", "basket", "jacket",
          ];
          await AsyncStorage.setItem("hardWords", JSON.stringify(defaultHardWords));
        }
      } catch (error) {
        console.error("Error initializing word lists:", error);
      }
    }

    loadFonts();
    initializeWordLists();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A24FE" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <AppProvider>
      <SoundProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerShown: false, // Hide headers for all screens
                contentStyle: {
                  backgroundColor: "#F8F5FF",
                },
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen
                name="Game"
                component={GameScreen}
                options={({ route }) => ({ title: `${route.params.level} Level` })}
              />
              <Stack.Screen name="Scoreboard" component={ScoreboardScreen} options={{ title: "Top Scores" }} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </SoundProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F5FF",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "600",
  },
});