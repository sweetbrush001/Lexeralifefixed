import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ImageBackground } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Audio } from "expo-av"; // Import Audio from expo-av
import { useContext } from "react";
import { SoundContext } from "../context/SoundContext"; // Import SoundContext
import Icon from 'react-native-vector-icons/FontAwesome'; // Import Icon from react-native-vector-icons

const HomeScreen = ({ navigation }) => {
  const { isMuted, toggleMute } = useContext(SoundContext); // Use SoundContext

  const playSound = async () => {
    if (!isMuted) {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/select-level.mp3") // Path to your sound file
      );
      await sound.playAsync();
    }
  };

  const handleLevelSelect = async (level) => {
    await playSound();
    navigation.navigate("Game", { level });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground source={require("../assets/images/background.webp")} style={styles.backgroundImage}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>Space Scramble</Text>
                <Text style={styles.subtitle}>Unscramble the words in Outerspace!</Text>
              </View>

              <View style={styles.difficultyContainer}>
                <TouchableOpacity
                  style={[styles.difficultyButton, styles.easyButton]}
                  onPress={() => handleLevelSelect("Easy")}
                >
                  <Text style={styles.buttonText}>Easy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.difficultyButton, styles.mediumButton]}
                  onPress={() => handleLevelSelect("Medium")}
                >
                  <Text style={styles.buttonText}>Medium</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.difficultyButton, styles.hardButton]}
                  onPress={() => handleLevelSelect("Hard")}
                >
                  <Text style={styles.buttonText}>Hard</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.scoreboardButton} onPress={() => navigation.navigate("Scoreboard")}>
                <Text style={styles.scoreboardButtonText}>View Scoreboard</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
            <Icon name={isMuted ? "volume-off" : "volume-up"} size={30} color="white" />
          </TouchableOpacity>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 32,
    color: "#f8f4fa", //#6A24FE
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "OpenDyslexic",
    fontSize: 18,
    color: "#d1a7e7",
    textAlign: "center",
  },
  difficultyContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  chooseText: {
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 22,
    color: "#333",
    marginBottom: 20,
  },
  difficultyButton: {
    width: "80%",
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  easyButton: {
    backgroundColor: "#4CAF50",
  },
  mediumButton: {
    backgroundColor: "#2196F3",
  },
  hardButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 20,
    color: "white",
  },
  scoreboardButton: {
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#9C27B0",
    width: "80%",
    alignItems: "center",
  },
  scoreboardButtonText: {
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 18,
    color: "white",
  },
  muteButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#FF9800",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeScreen;